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
import { get } from 'lodash';
import { isAuthorized } from '../../../utils';

const wrappedClusterClients = new WeakSet();
const wrappedScopedClients = new WeakSet();



function buildPath(params = {}) {
  const path = params.path || '';
  const querystring = params.querystring;
  if (!querystring || path.includes('?')) {
    return path;
  }
  if (typeof querystring === 'string') {
    return `${path}?${querystring}`;
  }
  return `${path}?${new URLSearchParams(querystring).toString()}`;
}

function buildRule(params = {}) {
  const method = params.method || 'GET';
  const path = buildPath(params);
  const body = params.body
    ? typeof params.body === 'string'
      ? params.body
      : JSON.stringify(params.body)
    : '';

  return method + path + body;
}

function matchesStandardWhitelist(result, kibanaVersionIndex) {
  const params = get(result, 'meta.request.params', {});
  return whitelistMap(kibanaVersionIndex)[buildRule(params)] || false;
}

// Matches the internal request that Kibana's spaces plugin issues to read the
// default space saved object (`space:default`) during the auth handshake.
// @see https://git.floragunn.com/search-guard/search-guard-kibana-plugin/-/issues/552
//
// We match on HTTP method + document id only, tolerant of the index name, the
// querystring and ':' vs '%3A' encoding. Those vary between Kibana releases
// (e.g. 9.4.2 -> 9.4.3), so an exact `method + path + body` string match keyed
// by the version-suffixed index silently stops matching on upgrade. When it
// stops matching we no longer inject the kibanaserver credentials, the internal
// request reaches ES with no proxy headers, Search Guard answers with an
// authentication_exception, and the spaces plugin ends up in a 401 re-auth loop.
const SPACE_DEFAULT_DOC = /\/_doc\/space(?:%3A|:)default(?:\?|$)/;

function isInternalRequest(headers) {
  // Kibana strips the end-user credentials from internal/system requests. Depending
  // on the Kibana version the authorization header is either an empty string or absent.
  // If we don't limit to internal requests, we would also inject auth for real
  // proxy-auth requests.
  return headers.authorization === '' || headers.authorization == null;
}

function matchesProxyWhitelist(result) {
  const params = get(result, 'meta.request.params', {});
  const headers = params.headers || {};

  if (!isInternalRequest(headers)) {
    return false;
  }

  const method = (params.method || 'GET').toUpperCase();
  return method === 'GET' && SPACE_DEFAULT_DOC.test(buildPath(params));
}

function shouldBeAuthorized({ result, kibanaVersionIndex, authType }) {
  if (matchesStandardWhitelist(result, kibanaVersionIndex)) {
    return true;
  }

  if (authType === 'proxy' && matchesProxyWhitelist(result)) {
    return true;
  }

  return false;
}

function whitelistMap(kibanaVersionIndex) {
  return {
    [`POST/${kibanaVersionIndex}/_search{"size":100,"seq_no_primary_term":true,"from":0,"query":{"bool":{"filter":[{"bool":{"should":[{"match":{"ingest-package-policies.package.name":"endpoint"}}],"minimum_should_match":1}},{"bool":{"should":[{"bool":{"must":[{"term":{"type":"ingest-package-policies"}}],"must_not":[{"exists":{"field":"namespace"}},{"exists":{"field":"namespaces"}}]}}],"minimum_should_match":1}}]}},"sort":[{"ingest-package-policies.updated_at":{"order":"desc","unmapped_type":"date"}}]}`]:
      true,
  };
}

export function rootScopedClientRequestWrapper({ configService, kibanaVersionIndex, logger }) {
  const authType = configService.get('searchguard.auth.type', null);

  return (error, result) => {
    if (error || !result) {
      return;
    }

    const hasAuth = isAuthorized(result) || isAuthorized(result, 'Authorization');
    if (hasAuth) {
      return;
    }

    const authorize = shouldBeAuthorized({ result, kibanaVersionIndex, authType });

    // Diagnostic aid. Under proxy auth, Kibana's internal/system requests reach
    // Elasticsearch without proxy headers, so Search Guard rejects them unless we
    // inject the kibanaserver credentials below. Which requests these are changes
    // between Kibana releases (e.g. PR #271314 reworked reverse-proxy run_as user
    // profile retrieval in 9.4.3), and an unrecognized one silently turns into a
    // 401 re-auth loop. Log every credential-less request we did NOT handle so the
    // next regression is diagnosable at debug level. Only method + path are logged
    // (no headers/credentials); enable with logging.loggers for `plugins.searchguard`.
    if (logger && authType === 'proxy' && isInternalRequest(get(result, 'meta.request.params.headers', {})) && !authorize) {
      const params = get(result, 'meta.request.params', {});
      logger.debug(
        `Unhandled credential-less ES request under proxy auth: ${params.method || 'GET'} ${buildPath(params)}`
      );
    }

    if (!authorize) {
      return;
    }

    const { username, password } = configService.get('elasticsearch', {});
    if (!username || !password) {
      return;
    }

    const headers = get(result, 'meta.request.params.headers', {});
    headers.authorization = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
    result.meta.request.params.headers = headers;
  };
}

export function registerRootScopedClientRequestWrapper({
  elasticsearch,
  requestWrapper,
}) {
  const clusterClient = elasticsearch && elasticsearch.client;
  if (!clusterClient || typeof clusterClient.asScoped !== 'function') {
    return;
  }

  if (wrappedClusterClients.has(clusterClient)) {
    return;
  }

  const originalAsScoped = clusterClient.asScoped.bind(clusterClient);

  clusterClient.asScoped = function wrappedAsScoped(request) {
    const scopedClusterClient = originalAsScoped(request);
    const scopedEsClient = scopedClusterClient && scopedClusterClient.asCurrentUser;

    if (
      scopedEsClient &&
      scopedEsClient.diagnostic &&
      typeof scopedEsClient.diagnostic.on === 'function' &&
      !wrappedScopedClients.has(scopedEsClient)
    ) {
      scopedEsClient.diagnostic.on('request', requestWrapper);
      wrappedScopedClients.add(scopedEsClient);
    }

    return scopedClusterClient;
  };

  wrappedClusterClients.add(clusterClient);
}
