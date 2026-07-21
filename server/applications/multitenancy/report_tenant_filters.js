/*
 *    Copyright 2026 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * Tenant filters for the Kibana Reporting read endpoints (task t-g8se9v).
 *
 * Kibana Reporting reads and writes its report documents as the internal user,
 * so its own Elasticsearch calls carry no sgtenant header and its list filter
 * (term created_by) matches every report under Search Guard. The HTTP-layer
 * block in report_tenant_scoping.js intercepts the read endpoints and uses ONE
 * of the filters below to answer "which reports belong to the current tenant".
 *
 * The filter is a pluggable seam (searchguard.multitenancy.report_tenant_scoping.filter):
 *
 * - NodeDecryptFilter ('node_decrypt', ACTIVE DEFAULT — assumes the Search
 *   Guard ES backend does not filter the reporting indices at all): every
 *   report doc carries its creating request's headers, encrypted with
 *   xpack.reporting.encryptionKey, in payload.headers — including sgtenant.
 *   The filter decrypts each hit with the mirrored key and keeps
 *   current-tenant matches. Pagination cannot reuse the raw from/size offsets
 *   (they must apply to FILTERED results), so pages are served by scanning
 *   matches from the top via a point-in-time search_after loop.
 * - HeaderPassthroughFilter ('header_passthrough'): the backend filters the
 *   reporting indices by the sgtenant header on the ES call. Requires backend
 *   support; results are used as-is with exact pagination and counts.
 * - TermFilter ('term'): the backend stamps a queryable sg_tenant field on the
 *   docs but does not auto-filter; the filter adds a term clause. Requires
 *   backend support.
 *
 * Query/response shapes replicate reporting's own jobs_query.ts and
 * Report.toApiJSON() (x-pack/platform/plugins/private/reporting/server), minus
 * the broken term-created_by clause. Deliberate deviations are noted inline.
 */

import { omit } from 'lodash';
import {
  cryptoFactory,
  REPORTING_DATA_STREAM_ALIAS,
  REPORTING_DATA_STREAM_WILDCARD_WITH_LEGACY,
} from '@kbn/reporting-server';
import { GLOBAL_TENANT_NAME, PRIVATE_TENANT_NAME } from '../../../common/multitenancy';

export const FILTER_MODES = {
  NODE_DECRYPT: 'node_decrypt',
  HEADER_PASSTHROUGH: 'header_passthrough',
  TERM: 'term',
};

// Field name the Search Guard ES backend is expected to stamp on report docs
// (Tier B / 'term' mode backend contract).
export const SG_TENANT_FIELD = 'sg_tenant';

export const DEFAULT_MAX_SCAN_DOCS = 10000;
export const DEFAULT_SCAN_BATCH_SIZE = 100;
const PIT_KEEP_ALIVE = '30s';

// Reporting keeps Report.migration_version hardcoded to this value in
// Report's constructor, so toApiJSON() always returns it (report.ts).
const REPORT_MIGRATION_VERSION = '7.14.0';

// Copied from reporting's lib/store/runtime_fields.ts — not exported by any
// @kbn package, so it cannot be imported here.
const FIELD_QUEUE_TIME_MS = 'queue_time_ms';
const FIELD_EXECUTION_TIME_MS = 'execution_time_ms';

const RUNTIME_FIELDS = {
  [FIELD_QUEUE_TIME_MS]: {
    type: 'long',
    script: {
      source:
        `if (!doc.containsKey('created_at') || doc['created_at'].empty) { return; }\n` +
        `if (!doc.containsKey('started_at') || doc['started_at'].empty) { return; }\n` +
        `emit(doc['started_at'].value.millis - doc['created_at'].value.millis);`,
    },
  },
  [FIELD_EXECUTION_TIME_MS]: {
    type: 'long',
    script: {
      source:
        `if (!doc.containsKey('completed_at') || doc['completed_at'].empty) { return; }\n` +
        `if (!doc.containsKey('started_at') || doc['started_at'].empty) { return; }\n` +
        `emit(doc['completed_at'].value.millis - doc['started_at'].value.millis);`,
    },
  },
};

const RUNTIME_FIELD_KEYS = [FIELD_QUEUE_TIME_MS, FIELD_EXECUTION_TIME_MS];

/**
 * Normalize a tenant name to its canonical form so that the current request's
 * tenant and a report's stored tenant always compare through one function.
 * Mirrors the global/private aliasing of MultitenancyLifecycle.getExternalTenant,
 * plus the historic empty-string encoding of the global tenant.
 *
 * Returns null for anything that is not a usable tenant name (missing header,
 * repeated header, non-string) — callers must treat null as "no match" (fail
 * closed), never as a wildcard.
 *
 * @param {unknown} value
 * @returns {string|null}
 */
export function canonicalizeTenantName(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const name = value.trim();
  // Historic wire encoding of the global tenant is an empty string.
  if (name === '') {
    return GLOBAL_TENANT_NAME;
  }
  if (name.toLowerCase() === 'global' || name.toUpperCase() === GLOBAL_TENANT_NAME) {
    return GLOBAL_TENANT_NAME;
  }
  // The private-tenant feature no longer exists in Search Guard; the alias is
  // kept only so the compare stays a plain string compare if it is encountered.
  if (name.toLowerCase() === 'private') {
    return PRIVATE_TENANT_NAME;
  }

  return name;
}

const isUsableTenant = (tenant) => typeof tenant === 'string' && tenant !== '';

// Parity with reporting's jobs_query.ts list() space clause: match the space
// id in either mapping, or docs from before space_id existed.
function spaceIdFilterClause(spaceId) {
  return {
    bool: {
      should: [
        { term: { space_id: spaceId } },
        { term: { 'space_id.keyword': spaceId } },
        { bool: { must_not: { exists: { field: 'space_id' } } } },
      ],
    },
  };
}

/**
 * Parity with reporting's getSearchBody() defaults (jobs_query.ts), with one
 * switch: node_decrypt mode must KEEP payload.headers in _source to be able to
 * decrypt the tenant (output.content stays excluded — it is large and never
 * needed here).
 */
function buildSearchBody({ must, size, from, keepPayloadHeaders = false }) {
  return {
    _source: {
      excludes: keepPayloadHeaders ? ['output.content'] : ['output.content', 'payload.headers'],
    },
    sort: [{ created_at: { order: 'desc' } }],
    size,
    ...(from !== undefined && { from }),
    fields: RUNTIME_FIELD_KEYS,
    runtime_mappings: RUNTIME_FIELDS,
    query: { constant_score: { filter: { bool: { must } } } },
  };
}

/**
 * Map a raw reporting-index search hit to the ReportApiJSON shape reporting's
 * own list/info endpoints emit — parity with Report.toApiJSON() including the
 * constructor defaults (report.ts). Always strips payload.headers and
 * output.content.
 *
 * Note: reporting's list() builds Report instances WITHOUT the hit's runtime
 * fields (only get()/info passes them), so list responses have no
 * queue_time_ms/execution_time_ms keys. includeFields=false replicates that.
 */
export function hitToApiJSON(hit, { includeFields = false } = {}) {
  const source = (hit && hit._source) || {};
  const fields = (includeFields && hit.fields) || {};

  return {
    id: hit._id,
    index: hit._index || REPORTING_DATA_STREAM_ALIAS,
    kibana_name: source.kibana_name,
    kibana_id: source.kibana_id,
    jobtype: source.jobtype,
    created_at: source.created_at,
    created_by: source.created_by || false,
    meta: source.meta || { objectType: 'unknown' },
    timeout: source.timeout,
    max_attempts: source.max_attempts,
    status: source.status || 'pending',
    attempts: source.attempts || 0,
    started_at: source.started_at,
    completed_at: source.completed_at,
    queue_time_ms: Array.isArray(fields[FIELD_QUEUE_TIME_MS])
      ? fields[FIELD_QUEUE_TIME_MS][0]
      : undefined,
    execution_time_ms: Array.isArray(fields[FIELD_EXECUTION_TIME_MS])
      ? fields[FIELD_EXECUTION_TIME_MS][0]
      : undefined,
    migration_version: REPORT_MIGRATION_VERSION,
    space_id: source.space_id,
    payload: omit(source.payload, 'headers'),
    output: omit(source.output || null, 'content'),
    metrics: source.metrics,
    scheduled_report_id: source.scheduled_report_id,
  };
}

// Parity with reporting's execQuery(): auth/missing-index errors resolve to
// "no results" instead of surfacing as 500s.
const SWALLOWED_STATUS_CODES = [401, 403, 404];

function isSwallowedEsError(error) {
  return error && SWALLOWED_STATUS_CODES.includes(error.statusCode);
}

class BaseTenantReportFilter {
  constructor({ logger }) {
    this.logger = logger;
  }

  // Startup self-test; throws when the filter cannot possibly work.
  selfTest() {}

  async search(client, params, options) {
    try {
      return options ? await client.search(params, options) : await client.search(params);
    } catch (error) {
      if (isSwallowedEsError(error)) {
        return undefined;
      }
      throw error;
    }
  }
}

/**
 * Tier C — no backend help. Decrypts each hit's payload.headers with the
 * mirrored xpack.reporting.encryptionKey and compares the stored sgtenant
 * against the current tenant. Fail closed: docs that are unstamped (no
 * encrypted headers — e.g. scheduled-report instances, pre-existing docs) or
 * undecryptable (wrong/rotated key) never match any tenant.
 *
 * Known limitation: after an encryption key rotation, older reports become
 * permanently invisible (indistinguishable from deletion). The per-query warn
 * log with the undecryptable count is the only signal.
 */
export class NodeDecryptFilter extends BaseTenantReportFilter {
  constructor({
    encryptionKey,
    logger,
    maxScanDocs = DEFAULT_MAX_SCAN_DOCS,
    batchSize = DEFAULT_SCAN_BATCH_SIZE,
  }) {
    super({ logger });
    this.mode = FILTER_MODES.NODE_DECRYPT;
    this.maxScanDocs = maxScanDocs;
    this.batchSize = batchSize;
    this.crypto = null;

    if (typeof encryptionKey === 'string' && encryptionKey !== '') {
      // Reporting's own crypto wrapper — guarantees the same envelope format
      // that encrypted payload.headers at index time.
      this.crypto = cryptoFactory(encryptionKey);
    }
  }

  /*
   * Decrypt round-trip self-test. Catches a missing/unusable key and crypto
   * library breakage at startup. It CANNOT catch a mirrored key that differs
   * from xpack.reporting.encryptionKey — that only shows up at runtime as
   * undecryptable docs (see the warn log in flushStats).
   */
  selfTest() {
    if (!this.crypto) {
      throw new Error(
        'searchguard.multitenancy.report_tenant_scoping.reporting_encryption_key is not set. ' +
          'It must mirror xpack.reporting.encryptionKey for the node_decrypt filter to work.'
      );
    }

    const probe = { sgtenant: 'sg-report-scoping-self-test' };
    const decrypted = this.crypto.decryptSync(this.crypto.encryptSync(probe));
    if (!decrypted || decrypted.sgtenant !== probe.sgtenant) {
      throw new Error('encryption key decrypt round-trip self-test failed');
    }
  }

  newStats() {
    return { undecryptable: 0, unstamped: 0 };
  }

  flushStats(stats, operation) {
    if (stats.undecryptable > 0) {
      this.logger.warn(
        `Report tenant scoping (${operation}): ${stats.undecryptable} report doc(s) could not be ` +
          'decrypted and were excluded (fail closed). If xpack.reporting.encryptionKey was rotated, ' +
          'reports created under the old key are permanently invisible; otherwise check that ' +
          'searchguard.multitenancy.report_tenant_scoping.reporting_encryption_key mirrors it exactly.'
      );
    }
    if (stats.unstamped > 0) {
      this.logger.debug(
        `Report tenant scoping (${operation}): ${stats.unstamped} report doc(s) carried no tenant ` +
          '(no encrypted headers or no sgtenant in them) and were excluded (fail closed).'
      );
    }
  }

  /**
   * @returns {string|null} the canonical tenant of the report doc, or null
   * when it has none / cannot be decrypted (fail closed).
   */
  tenantFromHit(hit, stats) {
    const source = (hit && hit._source) || {};
    const encryptedHeaders = source.payload && source.payload.headers;

    if (typeof encryptedHeaders !== 'string' || encryptedHeaders === '') {
      stats.unstamped += 1;
      return null;
    }
    if (!this.crypto) {
      stats.undecryptable += 1;
      return null;
    }

    let headers;
    try {
      headers = this.crypto.decryptSync(encryptedHeaders);
    } catch (error) {
      stats.undecryptable += 1;
      return null;
    }

    if (!headers || typeof headers !== 'object') {
      stats.unstamped += 1;
      return null;
    }

    // Never touch anything but the tenant — payload.headers also contains the
    // user's authorization header.
    const rawTenant = Object.prototype.hasOwnProperty.call(headers, 'sgtenant')
      ? headers.sgtenant
      : headers.sg_tenant;

    const tenant = canonicalizeTenantName(rawTenant);
    if (tenant === null) {
      stats.unstamped += 1;
    }
    return tenant;
  }

  matches(hit, tenant, stats) {
    const hitTenant = this.tenantFromHit(hit, stats);
    return hitTenant !== null && hitTenant === tenant;
  }

  /**
   * Scan the reporting indices top-down in reporting's list order and pick out
   * current-tenant matches. Offsets must apply to FILTERED results, so the raw
   * from offset is unusable; instead skip `skip` matches, then collect up to
   * `collectLimit` matches (collectLimit === null: count only, scan to
   * exhaustion). A point-in-time search_after loop with a _shard_doc
   * tiebreaker keeps the scan stable (reporting sorts on created_at only,
   * which search_after would skip/duplicate on ties). The scan is bounded by
   * maxScanDocs raw docs.
   */
  async scanMatches({ client, tenant, spaceId, skip = 0, collectLimit = null }) {
    const empty = { hits: [], matched: 0, scanned: 0 };
    if (!isUsableTenant(tenant)) {
      return empty;
    }

    let pit;
    try {
      pit = await client.openPointInTime({
        index: REPORTING_DATA_STREAM_WILDCARD_WITH_LEGACY,
        keep_alive: PIT_KEEP_ALIVE,
        ignore_unavailable: true,
      });
    } catch (error) {
      if (isSwallowedEsError(error)) {
        return empty;
      }
      throw error;
    }

    const stats = this.newStats();
    const wantHits = collectLimit !== null;
    const collected = [];
    let matched = 0;
    let scanned = 0;
    let searchAfter;
    let pitId = pit.id;

    try {
      while (scanned < this.maxScanDocs && !(wantHits && collected.length >= collectLimit)) {
        const body = {
          ...buildSearchBody({
            must: [spaceIdFilterClause(spaceId)],
            size: this.batchSize,
            keepPayloadHeaders: true,
          }),
          // A PIT search may not name an index, and needs the stable tiebreaker.
          sort: [{ created_at: { order: 'desc' } }, { _shard_doc: 'desc' }],
          pit: { id: pitId, keep_alive: PIT_KEEP_ALIVE },
          track_total_hits: false,
          ...(searchAfter !== undefined && { search_after: searchAfter }),
        };

        const response = await this.search(client, body);
        const hits = (response && response.hits && response.hits.hits) || [];
        if (hits.length === 0) {
          break;
        }
        pitId = (response && response.pit_id) || pitId;
        searchAfter = hits[hits.length - 1].sort;

        for (const hit of hits) {
          scanned += 1;
          if (this.matches(hit, tenant, stats)) {
            matched += 1;
            if (wantHits && matched > skip && collected.length < collectLimit) {
              collected.push(hit);
            }
          }
          if (scanned >= this.maxScanDocs || (wantHits && collected.length >= collectLimit)) {
            break;
          }
        }
      }

      if (scanned >= this.maxScanDocs) {
        this.logger.warn(
          `Report tenant scoping: scan stopped at the max_scan_docs bound (${this.maxScanDocs}); ` +
            'results may be incomplete. Consider raising ' +
            'searchguard.multitenancy.report_tenant_scoping.max_scan_docs or cleaning up old reports.'
        );
      }
    } finally {
      try {
        await client.closePointInTime({ id: pitId });
      } catch (error) {
        this.logger.debug(`Report tenant scoping: closing the point in time failed: ${error}`);
      }
    }

    this.flushStats(stats, wantHits ? 'list' : 'count');
    return { hits: collected, matched, scanned };
  }

  async list({ client, tenant, page, size, jobIds, spaceId }) {
    if (!isUsableTenant(tenant)) {
      return [];
    }

    if (jobIds && jobIds.length > 0) {
      // The ids clause already narrows the result set (this is the management
      // UI's latency-sensitive polling path) — page semantics don't apply, so
      // just filter that set by tenant. No scan loop, no PIT.
      const body = buildSearchBody({
        must: [{ ids: { values: jobIds } }, spaceIdFilterClause(spaceId)],
        size,
        keepPayloadHeaders: true,
      });
      const response = await this.search(client, {
        ...body,
        index: REPORTING_DATA_STREAM_WILDCARD_WITH_LEGACY,
      });
      const hits = (response && response.hits && response.hits.hits) || [];
      const stats = this.newStats();
      const matches = hits.filter((hit) => this.matches(hit, tenant, stats));
      this.flushStats(stats, 'list');
      return matches;
    }

    const { hits } = await this.scanMatches({
      client,
      tenant,
      spaceId,
      skip: page * size,
      collectLimit: size,
    });
    return hits;
  }

  /*
   * A _count has no documents to decrypt, so in node_decrypt mode count is a
   * scan-and-count over the same scoped scan the list uses. Deliberate
   * deviation from reporting's own count(), which has no space_id clause: the
   * count here matches what the list can actually show.
   */
  async count({ client, tenant, spaceId }) {
    const { matched } = await this.scanMatches({ client, tenant, spaceId });
    return matched;
  }

  async getById({ client, tenant, docId }) {
    if (!isUsableTenant(tenant) || !docId) {
      return null;
    }

    // Parity with reporting's get(): term on _id only, size 1, no space clause.
    const body = buildSearchBody({
      must: [{ term: { _id: docId } }],
      size: 1,
      keepPayloadHeaders: true,
    });
    const response = await this.search(client, {
      ...body,
      index: REPORTING_DATA_STREAM_WILDCARD_WITH_LEGACY,
    });
    const hit = response && response.hits && response.hits.hits && response.hits.hits[0];
    if (!hit) {
      return null;
    }

    const stats = this.newStats();
    const isMatch = this.matches(hit, tenant, stats);
    this.flushStats(stats, 'get');
    return isMatch ? hit : null;
  }
}

/**
 * Tier A — the backend filters the reporting indices by the sgtenant header on
 * the ES call itself. asInternalUser is a shared client, but per-request
 * headers still reach the wire (create_transport.ts merges options.headers),
 * so no scoped client is needed. Results are trusted as already scoped: exact
 * pagination and counts for free. INERT WITHOUT BACKEND SUPPORT — without it
 * this filter returns UNSCOPED results.
 */
export class HeaderPassthroughFilter extends BaseTenantReportFilter {
  constructor({ logger }) {
    super({ logger });
    this.mode = FILTER_MODES.HEADER_PASSTHROUGH;
  }

  transportOptions(tenant) {
    return { headers: { sgtenant: tenant } };
  }

  async list({ client, tenant, page, size, jobIds, spaceId }) {
    if (!isUsableTenant(tenant)) {
      return [];
    }

    // Backend-filtered, so reporting's raw from offset applies to already
    // scoped results — full query parity (minus term created_by).
    const body = buildSearchBody({
      must: [...(jobIds && jobIds.length > 0 ? [{ ids: { values: jobIds } }] : []), spaceIdFilterClause(spaceId)],
      size,
      from: size * page,
    });
    const response = await this.search(
      client,
      { ...body, index: REPORTING_DATA_STREAM_WILDCARD_WITH_LEGACY },
      this.transportOptions(tenant)
    );
    return (response && response.hits && response.hits.hits) || [];
  }

  async count({ client, tenant, spaceId }) {
    if (!isUsableTenant(tenant)) {
      return 0;
    }

    try {
      // Deliberate deviation from reporting's count() (which has no space_id
      // clause): keep count consistent with what the list can show.
      const response = await client.count(
        {
          index: REPORTING_DATA_STREAM_WILDCARD_WITH_LEGACY,
          query: { constant_score: { filter: { bool: { must: [spaceIdFilterClause(spaceId)] } } } },
        },
        this.transportOptions(tenant)
      );
      return (response && response.count) || 0;
    } catch (error) {
      if (isSwallowedEsError(error)) {
        return 0;
      }
      throw error;
    }
  }

  async getById({ client, tenant, docId }) {
    if (!isUsableTenant(tenant) || !docId) {
      return null;
    }

    const body = buildSearchBody({ must: [{ term: { _id: docId } }], size: 1 });
    const response = await this.search(
      client,
      { ...body, index: REPORTING_DATA_STREAM_WILDCARD_WITH_LEGACY },
      this.transportOptions(tenant)
    );
    return (response && response.hits && response.hits.hits && response.hits.hits[0]) || null;
  }
}

/**
 * Tier B — the backend stamps a queryable sg_tenant field on report docs (but
 * does not auto-filter), so the filter adds its own term clause. Exact
 * pagination and counts, no decrypt. INERT WITHOUT BACKEND SUPPORT — without
 * the stamped field every query matches nothing (fail closed).
 */
export class TermFilter extends BaseTenantReportFilter {
  constructor({ logger }) {
    super({ logger });
    this.mode = FILTER_MODES.TERM;
  }

  tenantClause(tenant) {
    return { term: { [SG_TENANT_FIELD]: tenant } };
  }

  async list({ client, tenant, page, size, jobIds, spaceId }) {
    if (!isUsableTenant(tenant)) {
      return [];
    }

    const body = buildSearchBody({
      must: [
        this.tenantClause(tenant),
        ...(jobIds && jobIds.length > 0 ? [{ ids: { values: jobIds } }] : []),
        spaceIdFilterClause(spaceId),
      ],
      size,
      from: size * page,
    });
    const response = await this.search(client, {
      ...body,
      index: REPORTING_DATA_STREAM_WILDCARD_WITH_LEGACY,
    });
    return (response && response.hits && response.hits.hits) || [];
  }

  async count({ client, tenant, spaceId }) {
    if (!isUsableTenant(tenant)) {
      return 0;
    }

    try {
      // Same deliberate space_id deviation as the other filters' count.
      const response = await client.count({
        index: REPORTING_DATA_STREAM_WILDCARD_WITH_LEGACY,
        query: {
          constant_score: {
            filter: { bool: { must: [this.tenantClause(tenant), spaceIdFilterClause(spaceId)] } },
          },
        },
      });
      return (response && response.count) || 0;
    } catch (error) {
      if (isSwallowedEsError(error)) {
        return 0;
      }
      throw error;
    }
  }

  async getById({ client, tenant, docId }) {
    if (!isUsableTenant(tenant) || !docId) {
      return null;
    }

    const body = buildSearchBody({
      must: [{ term: { _id: docId } }, this.tenantClause(tenant)],
      size: 1,
    });
    const response = await this.search(client, {
      ...body,
      index: REPORTING_DATA_STREAM_WILDCARD_WITH_LEGACY,
    });
    return (response && response.hits && response.hits.hits && response.hits.hits[0]) || null;
  }
}

export function createTenantReportFilter({ mode, encryptionKey, logger, maxScanDocs, batchSize }) {
  switch (mode) {
    case FILTER_MODES.NODE_DECRYPT:
      return new NodeDecryptFilter({ encryptionKey, logger, maxScanDocs, batchSize });
    case FILTER_MODES.HEADER_PASSTHROUGH:
      return new HeaderPassthroughFilter({ logger });
    case FILTER_MODES.TERM:
      return new TermFilter({ logger });
    default:
      throw new Error(`Unknown report tenant filter mode: ${mode}`);
  }
}
