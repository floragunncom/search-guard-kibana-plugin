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
 * HTTP-layer block that tenant-scopes the Kibana Reporting read endpoints
 * under Search Guard multitenancy (task t-g8se9v).
 *
 * Reporting reads its report docs as the internal user, so its own ES calls
 * carry no tenant and its list filter (term created_by, always false under
 * Search Guard) matches every report — the management UI leaks reports across
 * tenants. The one place with an unforgeable answer to "who is asking" is the
 * HTTP request itself: the MT lifecycle stamps request.headers.sgtenant at
 * onPreAuth after validating it against the backend. So this module registers
 * an onPostAuth hook that intercepts the reporting read routes:
 *
 * - GET /internal/reporting/jobs/list   → BLOCK + SERVE a tenant-scoped list;
 *   reporting's unscoped search never runs.
 * - GET /internal/reporting/jobs/count  → BLOCK + SERVE the scoped count.
 * - GET .../jobs/info/{docId}, GET .../jobs/download/{docId} (both prefixes),
 *   DELETE .../jobs/delete/{docId} (both prefixes) → GUARD + CONTINUE:
 *   scoped by-id lookup; miss → 404; hit → reporting's own handler serves
 *   (content streaming and delete cleanup are NOT reimplemented here).
 *
 * Guard semantics: "not in your tenant" is indistinguishable from "does not
 * exist" — always 404, never 403. Fail closed everywhere: no tenant on the
 * request (with MT enabled), undecryptable/unstamped docs, or internal errors
 * never fall through to reporting's unscoped handlers.
 *
 * MT disabled (the lifecycle re-checks the backend per request and maintains
 * searchguard.multitenancy.enabled): pass everything through untouched —
 * the sgtenant header is legitimately absent then, and blocking would brick
 * reporting on non-MT installations.
 *
 * The generate and schedule/scheduled routes are deliberately untouched (the
 * tenant is baked encrypted into the report doc at create; scheduled reporting
 * 403s under Search Guard before anything persists).
 *
 * Implementation notes:
 * - A lifecycle hook returning a KibanaResponse short-circuits the route
 *   handler (core's adoptToHapiOnPostAuthFormat), and hooks are awaited, so ES
 *   round-trips inside the hook are legal.
 * - The lifecycle response factory only builds redirects and errors, so the
 *   two 200-serving endpoints construct their responses with
 *   kibanaResponseFactory from @kbn/core-http-router-server-internal (a
 *   private core package this plugin already depends on for ensureRawRequest).
 */

import { kibanaResponseFactory } from '@kbn/core-http-router-server-internal';
import { INTERNAL_ROUTES, PUBLIC_ROUTES } from '@kbn/reporting-common';
import {
  FILTER_MODES,
  canonicalizeTenantName,
  createTenantReportFilter,
  hitToApiJSON,
} from './report_tenant_filters';

const { JOBS } = INTERNAL_ROUTES;

const DEFAULT_SPACE_ID = 'default';

function docIdFromPath(path, prefix) {
  if (!path.startsWith(`${prefix}/`)) {
    return null;
  }
  const remainder = path.slice(prefix.length + 1);
  // Reporting's routes take a single {docId} segment; anything deeper is not
  // one of the guarded routes.
  if (remainder === '' || remainder.includes('/')) {
    return null;
  }
  try {
    return decodeURIComponent(remainder);
  } catch (error) {
    return null;
  }
}

/**
 * Match a request against the five guarded/blocked reporting read routes.
 * Exact paths only, on both route prefixes — never a loose "includes" match.
 *
 * @param {string} method lowercase HTTP method
 * @param {string} path request pathname (base path already stripped by core)
 * @returns {{action: 'list'|'count'|'guard', docId?: string}|null}
 */
export function matchReportingReadRoute(method, path) {
  if (typeof path !== 'string') {
    return null;
  }

  if (method === 'get') {
    if (path === JOBS.LIST) {
      return { action: 'list' };
    }
    if (path === JOBS.COUNT) {
      return { action: 'count' };
    }

    const guardedGetPrefixes = [
      JOBS.INFO_PREFIX,
      JOBS.DOWNLOAD_PREFIX,
      PUBLIC_ROUTES.JOBS.DOWNLOAD_PREFIX,
    ];
    for (const prefix of guardedGetPrefixes) {
      const docId = docIdFromPath(path, prefix);
      if (docId !== null) {
        return { action: 'guard', docId };
      }
    }
  }

  if (method === 'delete') {
    for (const prefix of [JOBS.DELETE_PREFIX, PUBLIC_ROUTES.JOBS.DELETE_PREFIX]) {
      const docId = docIdFromPath(path, prefix);
      if (docId !== null) {
        return { action: 'guard', docId };
      }
    }
  }

  return null;
}

// Parity with reporting's internal list route: page/size/ids parsing.
export function parseListQuery(searchParams) {
  const page = parseInt(searchParams.get('page') || '0', 10) || 0;
  const size = Math.min(100, parseInt(searchParams.get('size') || '10', 10) || 10);
  const idsParam = searchParams.get('ids');
  const jobIds = idsParam ? idsParam.split(',') : null;
  return { page, size, jobIds };
}

const okJson = (body) =>
  kibanaResponseFactory.ok({ body, headers: { 'content-type': 'application/json' } });

const okText = (body) =>
  kibanaResponseFactory.ok({ body, headers: { 'content-type': 'text/plain' } });

/**
 * Register the onPostAuth block/guard hook. Must be installed so that it runs
 * for requests the MT lifecycle's onPreAuth has already processed (onPostAuth
 * always runs after onPreAuth), with the same configService instance the
 * lifecycle maintains searchguard.multitenancy.enabled on.
 *
 * @returns the registered handler (for tests), or null when the feature is
 * disabled.
 */
export function installReportTenantScoping({
  kibanaCore,
  elasticsearch,
  configService,
  logger,
  spacesService = null,
}) {
  const scopingConfig =
    configService.get('searchguard.multitenancy.report_tenant_scoping') || {};

  if (!scopingConfig.enabled) {
    logger.debug('Report tenant scoping is disabled');
    return null;
  }

  const mode = scopingConfig.filter || FILTER_MODES.NODE_DECRYPT;
  const filter = createTenantReportFilter({
    mode,
    encryptionKey: scopingConfig.reporting_encryption_key || null,
    logger,
    maxScanDocs: scopingConfig.max_scan_docs,
  });

  // Startup self-test — fail LOUDLY. A silent decrypt failure would be a
  // silent isolation loss, so if the filter cannot work, the reporting read
  // endpoints are refused (503) instead of served unscoped or served empty.
  let filterHealthy = true;
  try {
    filter.selfTest();
  } catch (error) {
    filterHealthy = false;
    logger.error(
      `FATAL: report tenant scoping self-test failed (filter=${mode}): ${error.message} ` +
        'All reporting read endpoints will answer 503 until this is fixed.'
    );
  }

  const getSpaceId = (request) => {
    // Parity with reporting: reportingCore.getSpaceId(request) || default.
    const spaceId =
      spacesService && typeof spacesService.getSpaceId === 'function'
        ? spacesService.getSpaceId(request)
        : undefined;
    return spaceId || DEFAULT_SPACE_ID;
  };

  const handler = async (request, response, toolkit) => {
    const method = (request.route && request.route.method) || '';
    const route = matchReportingReadRoute(method, request.url.pathname);
    if (!route) {
      return toolkit.next();
    }

    // Dynamic per-request signal maintained by the MT lifecycle (and the
    // periodic backend sync): when MT is disabled the sgtenant header is
    // legitimately absent everywhere — pass through untouched.
    if (!configService.get('searchguard.multitenancy.enabled')) {
      return toolkit.next();
    }

    try {
      if (!filterHealthy) {
        return response.customError({
          statusCode: 503,
          body: {
            message:
              'Search Guard: report tenant scoping is misconfigured (encryption key self-test ' +
              'failed at startup); refusing to serve reporting data. Check the Kibana log.',
          },
        });
      }

      // MT enabled: the tenant MUST come from the lifecycle-stamped header.
      // Absent/unusable → fail closed (empty list, zero count, 404) — never
      // fall through to reporting's unscoped query.
      const tenant = canonicalizeTenantName(request.headers.sgtenant);
      const client = elasticsearch.client.asInternalUser;

      if (route.action === 'list') {
        if (tenant === null) {
          return okJson([]);
        }
        const { page, size, jobIds } = parseListQuery(request.url.searchParams);
        const hits = await filter.list({
          client,
          tenant,
          page,
          size,
          jobIds,
          spaceId: getSpaceId(request),
        });
        return okJson(hits.map((hit) => hitToApiJSON(hit)));
      }

      if (route.action === 'count') {
        if (tenant === null) {
          return okText('0');
        }
        const total = await filter.count({ client, tenant, spaceId: getSpaceId(request) });
        return okText(String(total));
      }

      // guard: info / download / delete
      if (tenant === null) {
        return response.notFound();
      }
      const hit = await filter.getById({ client, tenant, docId: route.docId });
      if (!hit) {
        return response.notFound();
      }
      return toolkit.next();
    } catch (error) {
      logger.error(
        `Report tenant scoping failed for ${method.toUpperCase()} ${request.url.pathname}: ${
          error.stack || error
        }`
      );
      // Fail closed: never let reporting's unscoped handler run on an error.
      return response.customError({
        statusCode: 500,
        body: { message: 'Search Guard: report tenant scoping failed' },
      });
    }
  };

  kibanaCore.http.registerOnPostAuth(handler);
  logger.info(
    `Report tenant scoping installed (filter=${mode}${filterHealthy ? '' : ', UNHEALTHY'})`
  );
  return handler;
}
