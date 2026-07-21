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
 * - GET /internal/reporting/jobs/list and GET /internal/reporting/jobs/count
 *   → BLOCK + SERVE: redirect (302) to the Search Guard-owned scoped routes
 *   below, which serve the tenant-scoped response; reporting's unscoped
 *   search never runs.
 * - GET .../jobs/info/{docId}, GET .../jobs/download/{docId} (both prefixes),
 *   DELETE .../jobs/delete/{docId} (both prefixes) → GUARD + CONTINUE:
 *   scoped by-id lookup; miss → 404; hit → reporting's own handler serves
 *   (content streaming and delete cleanup are NOT reimplemented here).
 *
 * Why the redirect (learned at runtime, corrects the original design): hapi
 * only accepts an error, a takeover response, or a continue signal from
 * lifecycle extensions that run before the route handler, and core's
 * HapiResponseAdapter applies .takeover() ONLY to redirects (toRedirect) —
 * a 2xx KibanaResponse returned from onPostAuth is rejected by hapi with
 * "Lifecycle methods called before the handler can only return an error, a
 * takeover response, or a continue signal". So the 200s cannot be served
 * from the hook at all; they are served by real routes (registered on the
 * Search Guard router) that the hook redirects to. Redirect-from-lifecycle
 * is the same supported mechanism the MT lifecycle itself uses. The guard
 * responses (404) and the 5xx failure responses are hapi "errors" and remain
 * legal returns from the hook.
 *
 * Guard semantics: "not in your tenant" is indistinguishable from "does not
 * exist" — always 404, never 403. Fail closed everywhere: no tenant on the
 * request (with MT enabled), unstamped/undecryptable docs, or internal errors
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
 */

import { schema } from '@kbn/config-schema';
import { INTERNAL_ROUTES, PUBLIC_ROUTES } from '@kbn/reporting-common';
import { API_ROOT } from '../../utils/constants';
import {
  FILTER_MODES,
  canonicalizeTenantName,
  createTenantReportFilter,
  hitToApiJSON,
} from './report_tenant_filters';

const { JOBS } = INTERNAL_ROUTES;

const DEFAULT_SPACE_ID = 'default';

// Search Guard-owned routes that serve the tenant-scoped list/count 200s the
// onPostAuth hook cannot (see the module comment). The redirected request
// passes through the full lifecycle again, so the MT lifecycle stamps its
// sgtenant header exactly like any other /api request.
export const SCOPED_JOBS_LIST_ROUTE = `${API_ROOT}/multitenancy/reporting/jobs/list`;
export const SCOPED_JOBS_COUNT_ROUTE = `${API_ROOT}/multitenancy/reporting/jobs/count`;

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

const JSON_HEADERS = { 'content-type': 'application/json' };
const TEXT_HEADERS = { 'content-type': 'text/plain' };

const misconfiguredError = (responseFactory) =>
  responseFactory.customError({
    statusCode: 503,
    body: {
      message:
        'Search Guard: report tenant scoping is misconfigured (encryption key self-test ' +
        'failed at startup); refusing to serve reporting data. Check the Kibana log.',
    },
  });

const internalError = (responseFactory) =>
  responseFactory.customError({
    statusCode: 500,
    body: { message: 'Search Guard: report tenant scoping failed' },
  });

/**
 * Register the scoped serving routes and the onPostAuth block/guard hook.
 * Must be installed so that the hook runs for requests the MT lifecycle's
 * onPreAuth has already processed (onPostAuth always runs after onPreAuth),
 * with the same configService instance the lifecycle maintains
 * searchguard.multitenancy.enabled on.
 *
 * @returns the registered hook handler (for tests), or null when the feature
 * is disabled.
 */
export function installReportTenantScoping({
  kibanaCore,
  kibanaRouter,
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

  const getClient = () => elasticsearch.client.asInternalUser;

  const getSpaceId = (request) => {
    // Parity with reporting: reportingCore.getSpaceId(request) || default.
    const spaceId =
      spacesService && typeof spacesService.getSpaceId === 'function'
        ? spacesService.getSpaceId(request)
        : undefined;
    return spaceId || DEFAULT_SPACE_ID;
  };

  // The current tenant for a serving route. null means fail closed. These
  // routes are only meaningful under MT; called directly with MT disabled
  // they 404 (the hook never redirects to them in that state).
  const resolveTenant = (request) => canonicalizeTenantName(request.headers.sgtenant);

  kibanaRouter.get(
    {
      path: SCOPED_JOBS_LIST_ROUTE,
      // Parity with reporting's internal jobs/list route validation.
      validate: {
        query: schema.object({
          page: schema.string({ defaultValue: '0' }),
          size: schema.string({ defaultValue: '10' }),
          ids: schema.maybe(schema.string()),
        }),
      },
    },
    async (context, request, response) => {
      try {
        if (!filterHealthy) {
          return misconfiguredError(response);
        }
        if (!configService.get('searchguard.multitenancy.enabled')) {
          return response.notFound();
        }
        const tenant = resolveTenant(request);
        if (tenant === null) {
          return response.ok({ body: [], headers: JSON_HEADERS });
        }
        const { page, size, jobIds } = parseListQuery(request.url.searchParams);
        const hits = await filter.list({
          client: getClient(),
          tenant,
          page,
          size,
          jobIds,
          spaceId: getSpaceId(request),
        });
        return response.ok({ body: hits.map((hit) => hitToApiJSON(hit)), headers: JSON_HEADERS });
      } catch (error) {
        logger.error(`Report tenant scoping (list route) failed: ${error.stack || error}`);
        return internalError(response);
      }
    }
  );

  kibanaRouter.get(
    {
      path: SCOPED_JOBS_COUNT_ROUTE,
      validate: false,
    },
    async (context, request, response) => {
      try {
        if (!filterHealthy) {
          return misconfiguredError(response);
        }
        if (!configService.get('searchguard.multitenancy.enabled')) {
          return response.notFound();
        }
        const tenant = resolveTenant(request);
        if (tenant === null) {
          return response.ok({ body: '0', headers: TEXT_HEADERS });
        }
        const total = await filter.count({
          client: getClient(),
          tenant,
          spaceId: getSpaceId(request),
        });
        return response.ok({ body: String(total), headers: TEXT_HEADERS });
      } catch (error) {
        logger.error(`Report tenant scoping (count route) failed: ${error.stack || error}`);
        return internalError(response);
      }
    }
  );

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
        return misconfiguredError(response);
      }

      if (route.action === 'list' || route.action === 'count') {
        // BLOCK + SERVE via redirect — the scoped route answers with the 200
        // this hook is not allowed to produce (see module comment). Query
        // string is forwarded as-is; the tenant travels via the lifecycle
        // stamping on the redirected request, not via the URL.
        const target =
          route.action === 'list' ? SCOPED_JOBS_LIST_ROUTE : SCOPED_JOBS_COUNT_ROUTE;
        const location = `${kibanaCore.http.basePath.get(request)}${target}${
          request.url.search || ''
        }`;
        return response.redirected({ headers: { location } });
      }

      // guard: info / download / delete. The tenant MUST come from the
      // lifecycle-stamped header; absent/unusable → fail closed with 404 —
      // never fall through to reporting's unscoped query.
      const tenant = canonicalizeTenantName(request.headers.sgtenant);
      if (tenant === null) {
        return response.notFound();
      }
      const hit = await filter.getById({ client: getClient(), tenant, docId: route.docId });
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
      return internalError(response);
    }
  };

  kibanaCore.http.registerOnPostAuth(handler);
  logger.info(
    `Report tenant scoping installed (filter=${mode}${filterHealthy ? '' : ', UNHEALTHY'})`
  );
  return handler;
}
