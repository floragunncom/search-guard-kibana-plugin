/*
 *    Copyright 2021 floragunn GmbH
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

function whitelistMap(kibanaVersionIndex) {
  return {
    [`POST/${kibanaVersionIndex}/_search{"size":100,"seq_no_primary_term":true,"from":0,"query":{"bool":{"filter":[{"bool":{"should":[{"match":{"ingest-package-policies.package.name":"endpoint"}}],"minimum_should_match":1}},{"bool":{"should":[{"bool":{"must":[{"term":{"type":"ingest-package-policies"}}],"must_not":[{"exists":{"field":"namespace"}},{"exists":{"field":"namespaces"}}]}}],"minimum_should_match":1}}]}},"sort":[{"ingest-package-policies.updated_at":{"order":"desc","unmapped_type":"date"}}]}`]:
      true,
  };
}

function proxyWhitelistMap(kibanaVersionIndex) {
  return {
    // Only applies when searchguard.auth.type === 'proxy'.
    // @see https://git.floragunn.com/search-guard/search-guard-kibana-plugin/-/issues/552
    [`GET/${kibanaVersionIndex}/_doc/space%3Adefault`]: true,
  };
}

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

function matchesProxyWhitelist(result, kibanaVersionIndex) {
  const params = get(result, 'meta.request.params', {});
  const headers = params.headers || {};

  // Internal requests explicitly set authorization: ''
  // If we don't limit to this, we would also inject auth for real proxy-auth requests
  if (headers.authorization !== '') {
    return false;
  }

  return proxyWhitelistMap(kibanaVersionIndex)[buildRule(params)] || false;
}

function shouldBeAuthorized({ result, kibanaVersionIndex, authType }) {
  if (matchesStandardWhitelist(result, kibanaVersionIndex)) {
    return true;
  }

  if (authType === 'proxy' && matchesProxyWhitelist(result, kibanaVersionIndex)) {
    return true;
  }

  return false;
}

export function rootScopedClientRequestWrapper({ configService, kibanaVersionIndex }) {
  const authType = configService.get('searchguard.auth.type', null);

  return (error, result) => {
    if (error || !result) {
      return;
    }

    const hasAuth = isAuthorized(result) || isAuthorized(result, 'Authorization');
    if (hasAuth || !shouldBeAuthorized({ result, kibanaVersionIndex, authType })) {
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
