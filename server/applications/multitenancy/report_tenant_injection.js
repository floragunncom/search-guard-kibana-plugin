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

/**
 * Tenant injection for Kibana Reporting's internal-user Elasticsearch calls.
 *
 * PROBLEM
 *   Kibana Reporting reads and writes its report documents with the shared
 *   internal-user ES client (`asInternalUser` = kibanaserver). Those ES calls
 *   carry no `sgtenant` header, so the Search Guard ES backend cannot tell
 *   which tenant a report belongs to: the management UI lists every tenant's
 *   reports.
 *
 * MECHANISM (three steps)
 *   1. CAPTURE  At onPreAuth — AFTER the Search Guard multitenancy lifecycle
 *      has validated and stamped `request.headers.sgtenant` — remember
 *      `request.id -> tenant` for requests to the reporting HTTP endpoints.
 *   2. CORRELATE  Kibana core stamps every internal-user ES call with an
 *      `x-opaque-id` header equal to the originating HTTP request's
 *      `request.id` (core's execution-context AsyncLocalStorage; see
 *      src/core/packages/elasticsearch/client-server-internal/src/create_transport.ts).
 *   3. INJECT  In the ES client's `diagnostic('request')` hook — which fires
 *      before the bytes go on the wire and shares the request's params
 *      object — look the tenant up by `x-opaque-id` and set the `sgtenant`
 *      header on reporting-index calls that don't already have one.
 *
 * The Kibana side only CONVEYS the tenant. Scoping/enforcement is the SG ES
 * backend's job (filter reads by the header, stamp the doc's tenant at
 * create). Without backend support the injected header is inert.
 *
 * See REPORT_TENANT_INJECTION.md (same directory) for the full design,
 * security analysis, limitations, and operational notes. Tasks: t-ps8dqr
 * (this implementation), t-mjqsfg (investigation), t-g8se9v (the HTTP-layer
 * block alternative).
 */

export const DEFAULT_TTL_MS = 30 * 1000;
export const DEFAULT_MAX_ENTRIES = 5000;
export const DEFAULT_SWEEP_INTERVAL_MS = 60 * 1000;
export const DEFAULT_WARN_INTERVAL_MS = 30 * 1000;

// HTTP endpoints whose requests can lead to reporting ES calls. Over-capturing
// is harmless (the entry is only ever read for reporting ES calls and is
// deleted when the request finishes), so plain prefixes are enough here.
const REPORTING_HTTP_PATH_PREFIXES = ['/api/reporting/', '/internal/reporting/'];

/**
 * The originating request id is the first segment of the x-opaque-id header.
 * Kibana core may append an execution-context suffix after a semicolon,
 * e.g. "01a2b3c4-...;kibana:application:reporting:...".
 * @param {unknown} opaqueId
 * @returns {string|null}
 */
export function extractRequestId(opaqueId) {
  if (typeof opaqueId !== 'string' || opaqueId === '') return null;
  const requestId = opaqueId.split(';')[0].trim();
  return requestId === '' ? null : requestId;
}

/**
 * @param {unknown} pathname pathname of an incoming HTTP request
 * @returns {boolean}
 */
export function isReportingHttpPath(pathname) {
  if (typeof pathname !== 'string') return false;
  return REPORTING_HTTP_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Matches ES calls that target the reporting indices:
 *   - the data stream:        ".kibana-reporting/_doc/..." (writes)
 *   - its backing indices:    ".ds-.kibana-reporting-2026.07.21-000001/..."
 *   - searches (URL-encoded): ".reporting-*%2C.kibana-reporting*" + "/_search"
 * @param {unknown} path the `params.path` of an outgoing ES request
 * @returns {boolean}
 */
export function isReportingEsPath(path) {
  if (typeof path !== 'string') return false;

  let decoded = path;
  try {
    decoded = decodeURIComponent(path);
  } catch (error) {
    // malformed escape sequence: match against the raw path
  }

  return decoded.includes('.kibana-reporting') || decoded.includes('.reporting-');
}

/**
 * Bounded in-memory `request.id -> tenant` registry. Never grows without
 * limit, by three independent mechanisms:
 *   1. deterministic delete when the originating request finishes (onPreResponse),
 *   2. a TTL on every entry (also enforced on read),
 *   3. a hard size cap with FIFO eviction (Map preserves insertion order).
 */
export class RequestTenantRegistry {
  constructor({ ttlMs = DEFAULT_TTL_MS, maxEntries = DEFAULT_MAX_ENTRIES } = {}) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
    this.entries = new Map();
  }

  get size() {
    return this.entries.size;
  }

  /**
   * @param {string} requestId
   * @param {string} tenant
   * @param {number} [now]
   * @returns {'stored'|'collision'|'ignored'}
   *   'collision' means a live entry for the same id held a DIFFERENT
   *   tenant. Request ids are server-generated UUIDs by default, so this
   *   cannot happen unless ids are client-influenced
   *   (server.requestId.allowFromAnyIp / trusted proxies) or a proxy reuses
   *   x-opaque-id values. Both entries are dropped (fail closed for both
   *   requests); the caller should log loudly.
   */
  set(requestId, tenant, now = Date.now()) {
    if (!requestId || !tenant) return 'ignored';

    const existing = this.entries.get(requestId);
    if (existing && now - existing.ts <= this.ttlMs && existing.tenant !== tenant) {
      this.entries.delete(requestId);
      return 'collision';
    }

    // Re-inserting must refresh the FIFO position, otherwise a long-lived
    // id could be evicted while its request is still in flight.
    this.entries.delete(requestId);

    if (this.entries.size >= this.maxEntries) {
      const oldest = this.entries.keys().next().value;
      if (oldest !== undefined) this.entries.delete(oldest);
    }

    this.entries.set(requestId, { tenant, ts: now });
    return 'stored';
  }

  /**
   * @param {unknown} opaqueId the x-opaque-id of an outgoing ES call
   * @param {number} [now]
   * @returns {string|null} the tenant, or null when unknown/expired
   */
  getByOpaqueId(opaqueId, now = Date.now()) {
    const requestId = extractRequestId(opaqueId);
    if (!requestId) return null;

    const entry = this.entries.get(requestId);
    if (!entry) return null;

    if (now - entry.ts > this.ttlMs) {
      this.entries.delete(requestId);
      return null;
    }

    return entry.tenant;
  }

  /**
   * @param {string} requestId
   */
  delete(requestId) {
    if (requestId) this.entries.delete(requestId);
  }

  /**
   * Drop all expired entries.
   * @param {number} [now]
   * @returns {number} number of removed entries
   */
  sweep(now = Date.now()) {
    let removed = 0;
    for (const [requestId, entry] of this.entries.entries()) {
      if (now - entry.ts > this.ttlMs) {
        this.entries.delete(requestId);
        removed++;
      }
    }
    return removed;
  }
}

/**
 * Install the capture/cleanup HTTP hooks and the ES diagnostic injection.
 *
 * ORDERING REQUIREMENT: must be called AFTER
 * `kibanaCore.http.registerOnPreAuth(multitenancyLifecycle.onPreAuth)` —
 * onPreAuth hooks run in registration order, and the capture hook reads the
 * `sgtenant` header that the multitenancy lifecycle stamps.
 *
 * @param {object} deps
 * @param {object} deps.kibanaCore Kibana core setup contract
 * @param {object} deps.elasticsearch core elasticsearch start contract (shared client)
 * @param {object} deps.configService Search Guard config service
 * @param {object} deps.logger
 * @param {object} [deps.options] overrides for tests: ttlMs, maxEntries,
 *   sweepIntervalMs, warnIntervalMs, registerSweepTimer
 * @returns {RequestTenantRegistry|null} the registry (for tests/inspection),
 *   or null when the feature is disabled
 */
export function installReportTenantInjection({
  kibanaCore,
  elasticsearch,
  configService,
  logger,
  options = {},
}) {
  if (!configService.get('searchguard.multitenancy.report_tenant_injection.enabled')) {
    logger.debug('Report tenant injection is disabled (searchguard.multitenancy.report_tenant_injection.enabled)');
    return null;
  }

  const {
    ttlMs = DEFAULT_TTL_MS,
    maxEntries = DEFAULT_MAX_ENTRIES,
    sweepIntervalMs = DEFAULT_SWEEP_INTERVAL_MS,
    warnIntervalMs = DEFAULT_WARN_INTERVAL_MS,
    registerSweepTimer = true,
  } = options;

  const registry = new RequestTenantRegistry({ ttlMs, maxEntries });

  // --- 1. CAPTURE ----------------------------------------------------------
  // `request.headers.sgtenant` is only present when the multitenancy
  // lifecycle stamped it (MT enabled in the backend, authenticated request,
  // tenant validated). When MT is disabled the header is absent, nothing is
  // captured, nothing is injected: stock reporting behavior. That makes the
  // MT-disabled pass-through a structural property, not a code path.
  kibanaCore.http.registerOnPreAuth((request, response, toolkit) => {
    try {
      if (isReportingHttpPath(request.url.pathname)) {
        const tenant = request.headers.sgtenant;
        if (typeof tenant === 'string' && tenant !== '') {
          const result = registry.set(request.id, tenant);
          if (result === 'collision') {
            logger.warn(
              `Report tenant injection: request id collision with differing tenants for id "${request.id}" — ` +
                'dropped both entries (their reporting ES calls will carry no tenant). This cannot happen ' +
                'with server-generated request ids; check server.requestId.allowFromAnyIp / trusted proxies ' +
                'and any proxy that forwards or reuses x-opaque-id.'
            );
          }
        }
      }
    } catch (error) {
      // Never break request handling over bookkeeping.
      logger.error(`Report tenant injection: capture failed: ${error.message}`);
    }
    return toolkit.next();
  });

  // --- 2a. CLEANUP: deterministic delete on request completion --------------
  kibanaCore.http.registerOnPreResponse((request, preResponse, toolkit) => {
    try {
      registry.delete(request.id);
    } catch (error) {
      logger.error(`Report tenant injection: cleanup failed: ${error.message}`);
    }
    return toolkit.next();
  });

  // --- 2b. CLEANUP: TTL sweep safety net ------------------------------------
  if (registerSweepTimer) {
    const sweepTimer = setInterval(() => {
      const removed = registry.sweep();
      if (removed > 0) {
        // Entries are normally removed at onPreResponse; sweeping is only
        // reached for requests that never completed (client disconnects etc).
        logger.debug(`Report tenant injection: swept ${removed} expired entries`);
      }
    }, sweepIntervalMs);
    // Never keep the process alive because of this timer.
    sweepTimer.unref();
  }

  // --- 3. INJECT -------------------------------------------------------------
  // The diagnostic 'request' event fires synchronously before the transport
  // serializes the request; `params.headers` is the object that goes on the
  // wire, so mutating it here is effective.
  const client = elasticsearch.client.asInternalUser;
  if (!client || !client.diagnostic || typeof client.diagnostic.on !== 'function') {
    logger.error(
      'Report tenant injection: asInternalUser.diagnostic unavailable — injection NOT installed. ' +
        'Reporting ES calls will carry no tenant.'
    );
    return registry;
  }

  // Correlation misses while MT is enabled mean the backend will see
  // reporting calls without a tenant. That must be observable, but must not
  // flood the log: warn at most once per interval, with a counter.
  let missesSinceLastWarn = 0;
  let lastWarnAt = 0;

  client.diagnostic.on('request', (diagnosticError, result) => {
    try {
      if (diagnosticError) return;

      const esRequest = result && result.meta && result.meta.request;
      const params = (esRequest && esRequest.params) || {};
      if (!isReportingEsPath(params.path)) return;

      const headers = params.headers || (params.headers = {});
      // Never overwrite: a call that already carries a tenant (e.g. Search
      // Guard's own scoped calls) knows better than the correlation map.
      if (headers.sgtenant) return;

      const options_ = (esRequest && esRequest.options) || {};
      const opaqueId = headers['x-opaque-id'] || options_.opaqueId;
      const tenant = registry.getByOpaqueId(opaqueId);

      if (tenant) {
        headers.sgtenant = tenant;
        logger.debug(
          `Report tenant injection: injected tenant "${tenant}" on ${params.method} ${params.path}`
        );
        return;
      }

      // No correlation. Expected for background (task manager) calls, which
      // have no originating request — only warn when MT is enabled, because
      // only then is a missing tenant meaningful.
      if (configService.get('searchguard.multitenancy.enabled')) {
        missesSinceLastWarn++;
        const now = Date.now();
        if (now - lastWarnAt >= warnIntervalMs) {
          logger.warn(
            `Report tenant injection: ${missesSinceLastWarn} reporting ES call(s) without tenant ` +
              'correlation since the last notice (background/task-manager calls are expected here; ' +
              'interactive calls are not — if the management UI shows no reports, check that ' +
              'x-opaque-id stamping is intact and the registry is not evicting under load). ' +
              `Last: ${params.method} ${params.path}`
          );
          missesSinceLastWarn = 0;
          lastWarnAt = now;
        }
      }
    } catch (error) {
      logger.error(`Report tenant injection: diagnostic handler failed: ${error.message}`);
    }
  });

  logger.info(
    'Report tenant injection installed (capture=onPreAuth, cleanup=onPreResponse+TTL sweep, ' +
      `inject=asInternalUser diagnostic; ttl=${ttlMs}ms, cap=${maxEntries})`
  );

  return registry;
}
