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

import {
  rootScopedClientRequestWrapper,
  registerRootScopedClientRequestWrapper,
} from './root_scoped_client_request_wrapper';

const KIBANA_VERSION_INDEX = '.kibana_9.4.3';
const USERNAME = 'kibanaserver';
const PASSWORD = 'kibanaserver_pass';
const EXPECTED_AUTH = `Basic ${Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64')}`;

// The exact request/body the "standard" (non-proxy) whitelist matches.
const ENDPOINT_PACKAGE_POLICIES_BODY =
  '{"size":100,"seq_no_primary_term":true,"from":0,"query":{"bool":{"filter":[{"bool":{"should":[{"match":{"ingest-package-policies.package.name":"endpoint"}}],"minimum_should_match":1}},{"bool":{"should":[{"bool":{"must":[{"term":{"type":"ingest-package-policies"}}],"must_not":[{"exists":{"field":"namespace"}},{"exists":{"field":"namespaces"}}]}}],"minimum_should_match":1}}]}},"sort":[{"ingest-package-policies.updated_at":{"order":"desc","unmapped_type":"date"}}]}';

function makeConfigService({
  authType = 'proxy',
  username = USERNAME,
  password = PASSWORD,
} = {}) {
  return {
    get(key, defaultValue) {
      if (key === 'searchguard.auth.type') return authType;
      if (key === 'elasticsearch') return { username, password };
      return defaultValue;
    },
  };
}

function makeResult({
  method = 'GET',
  path,
  querystring,
  headers = { authorization: '' },
  body,
} = {}) {
  return { meta: { request: { params: { method, path, querystring, headers, body } } } };
}

function getInjectedAuth(result) {
  return result.meta.request.params.headers.authorization;
}

describe('rootScopedClientRequestWrapper', () => {
  describe('proxy auth - default space read (space:default)', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = rootScopedClientRequestWrapper({
        configService: makeConfigService({ authType: 'proxy' }),
        kibanaVersionIndex: KIBANA_VERSION_INDEX,
      });
    });

    it('injects the kibanaserver credentials for the internal space:default read', () => {
      const result = makeResult({
        method: 'GET',
        path: `/${KIBANA_VERSION_INDEX}/_doc/space%3Adefault`,
        headers: { authorization: '' },
      });

      wrapper(null, result);

      expect(getInjectedAuth(result)).toBe(EXPECTED_AUTH);
    });

    // Regression for the 9.4.2 -> 9.4.3 break: the previous implementation used an
    // exact string match keyed by the version-suffixed index, so any of the request
    // variations below silently stopped matching and produced a 401 re-auth loop.

    it('still matches when the index name / version differs from kibanaVersionIndex', () => {
      const result = makeResult({
        path: `/.kibana_9.5.0/_doc/space%3Adefault`,
        headers: { authorization: '' },
      });

      wrapper(null, result);

      expect(getInjectedAuth(result)).toBe(EXPECTED_AUTH);
    });

    it('still matches when the authorization header is absent instead of an empty string', () => {
      const result = makeResult({
        path: `/${KIBANA_VERSION_INDEX}/_doc/space%3Adefault`,
        headers: {},
      });

      wrapper(null, result);

      expect(getInjectedAuth(result)).toBe(EXPECTED_AUTH);
    });

    it('still matches when the doc id uses an unencoded colon', () => {
      const result = makeResult({
        path: `/${KIBANA_VERSION_INDEX}/_doc/space:default`,
        headers: { authorization: '' },
      });

      wrapper(null, result);

      expect(getInjectedAuth(result)).toBe(EXPECTED_AUTH);
    });

    it('still matches when a querystring is appended to the path', () => {
      const result = makeResult({
        path: `/${KIBANA_VERSION_INDEX}/_doc/space%3Adefault`,
        querystring: '_source_includes=space',
        headers: { authorization: '' },
      });

      wrapper(null, result);

      expect(getInjectedAuth(result)).toBe(EXPECTED_AUTH);
    });
  });

  describe('does not inject when it should not', () => {
    it('leaves requests that already carry credentials untouched', () => {
      const wrapper = rootScopedClientRequestWrapper({
        configService: makeConfigService({ authType: 'proxy' }),
        kibanaVersionIndex: KIBANA_VERSION_INDEX,
      });
      const result = makeResult({
        path: `/${KIBANA_VERSION_INDEX}/_doc/space%3Adefault`,
        headers: { authorization: 'Basic someone' },
      });

      wrapper(null, result);

      expect(getInjectedAuth(result)).toBe('Basic someone');
    });

    it('does not inject for the space:default read when auth type is not proxy', () => {
      const wrapper = rootScopedClientRequestWrapper({
        configService: makeConfigService({ authType: 'basicauth' }),
        kibanaVersionIndex: KIBANA_VERSION_INDEX,
      });
      const result = makeResult({
        path: `/${KIBANA_VERSION_INDEX}/_doc/space%3Adefault`,
        headers: { authorization: '' },
      });

      wrapper(null, result);

      expect(getInjectedAuth(result)).toBe('');
    });

    it('does not inject for unrelated internal requests (e.g. a user-profile lookup)', () => {
      const wrapper = rootScopedClientRequestWrapper({
        configService: makeConfigService({ authType: 'proxy' }),
        kibanaVersionIndex: KIBANA_VERSION_INDEX,
      });
      const result = makeResult({
        path: `/_security/profile/u_abcdef`,
        headers: { authorization: '' },
      });

      wrapper(null, result);

      expect(getInjectedAuth(result)).toBe('');
    });

    it('does not match a POST to the space:default path (wrong method)', () => {
      const wrapper = rootScopedClientRequestWrapper({
        configService: makeConfigService({ authType: 'proxy' }),
        kibanaVersionIndex: KIBANA_VERSION_INDEX,
      });
      const result = makeResult({
        method: 'POST',
        path: `/${KIBANA_VERSION_INDEX}/_doc/space%3Adefault`,
        headers: { authorization: '' },
      });

      wrapper(null, result);

      expect(getInjectedAuth(result)).toBe('');
    });

    it('does not inject when no kibanaserver credentials are configured', () => {
      const wrapper = rootScopedClientRequestWrapper({
        configService: makeConfigService({ authType: 'proxy', username: '', password: '' }),
        kibanaVersionIndex: KIBANA_VERSION_INDEX,
      });
      const result = makeResult({
        path: `/${KIBANA_VERSION_INDEX}/_doc/space%3Adefault`,
        headers: { authorization: '' },
      });

      wrapper(null, result);

      expect(getInjectedAuth(result)).toBe('');
    });

    it('ignores diagnostic errors and missing results', () => {
      const wrapper = rootScopedClientRequestWrapper({
        configService: makeConfigService({ authType: 'proxy' }),
        kibanaVersionIndex: KIBANA_VERSION_INDEX,
      });

      expect(() => wrapper(new Error('boom'), null)).not.toThrow();
      expect(() => wrapper(null, null)).not.toThrow();
    });
  });

  describe('standard whitelist (applies regardless of auth type)', () => {
    it('injects for the endpoint package-policies search', () => {
      const wrapper = rootScopedClientRequestWrapper({
        configService: makeConfigService({ authType: 'basicauth' }),
        kibanaVersionIndex: KIBANA_VERSION_INDEX,
      });
      const result = makeResult({
        method: 'POST',
        path: `/${KIBANA_VERSION_INDEX}/_search`,
        body: ENDPOINT_PACKAGE_POLICIES_BODY,
        headers: { authorization: '' },
      });

      wrapper(null, result);

      expect(getInjectedAuth(result)).toBe(EXPECTED_AUTH);
    });
  });

  describe('diagnostic logging', () => {
    it('logs unhandled credential-less requests under proxy auth (method + path only)', () => {
      const logger = { debug: jest.fn() };
      const wrapper = rootScopedClientRequestWrapper({
        configService: makeConfigService({ authType: 'proxy' }),
        kibanaVersionIndex: KIBANA_VERSION_INDEX,
        logger,
      });
      const result = makeResult({
        path: `/_security/profile/u_abcdef`,
        headers: { authorization: '' },
      });

      wrapper(null, result);

      expect(logger.debug).toHaveBeenCalledTimes(1);
      const message = logger.debug.mock.calls[0][0];
      expect(message).toContain('GET /_security/profile/u_abcdef');
      // Must never leak credentials/headers.
      expect(message).not.toContain('authorization');
    });

    it('does not log requests it handled', () => {
      const logger = { debug: jest.fn() };
      const wrapper = rootScopedClientRequestWrapper({
        configService: makeConfigService({ authType: 'proxy' }),
        kibanaVersionIndex: KIBANA_VERSION_INDEX,
        logger,
      });
      const result = makeResult({
        path: `/${KIBANA_VERSION_INDEX}/_doc/space%3Adefault`,
        headers: { authorization: '' },
      });

      wrapper(null, result);

      expect(logger.debug).not.toHaveBeenCalled();
    });

    it('does not log for non-proxy auth types', () => {
      const logger = { debug: jest.fn() };
      const wrapper = rootScopedClientRequestWrapper({
        configService: makeConfigService({ authType: 'basicauth' }),
        kibanaVersionIndex: KIBANA_VERSION_INDEX,
        logger,
      });

      wrapper(null, makeResult({ path: `/_security/profile/u_abcdef`, headers: { authorization: '' } }));

      expect(logger.debug).not.toHaveBeenCalled();
    });
  });
});

describe('registerRootScopedClientRequestWrapper', () => {
  function makeElasticsearch() {
    const on = jest.fn();
    const asCurrentUser = { diagnostic: { on } };
    const scopedClient = { asCurrentUser };
    const asScoped = jest.fn(() => scopedClient);
    return { elasticsearch: { client: { asScoped } }, on, scopedClient };
  }

  it('wraps asScoped and attaches the request wrapper to the current-user diagnostic', () => {
    const { elasticsearch, on, scopedClient } = makeElasticsearch();
    const requestWrapper = jest.fn();

    registerRootScopedClientRequestWrapper({ elasticsearch, requestWrapper });

    const scoped = elasticsearch.client.asScoped({ id: 'req-1' });

    expect(scoped).toBe(scopedClient);
    expect(on).toHaveBeenCalledWith('request', requestWrapper);
  });

  it('attaches the wrapper only once per scoped current-user client', () => {
    const { elasticsearch, on } = makeElasticsearch();

    registerRootScopedClientRequestWrapper({ elasticsearch, requestWrapper: jest.fn() });

    elasticsearch.client.asScoped({ id: 'req-1' });
    elasticsearch.client.asScoped({ id: 'req-2' });

    expect(on).toHaveBeenCalledTimes(1);
  });

  it('does not throw when there is no cluster client', () => {
    expect(() =>
      registerRootScopedClientRequestWrapper({ elasticsearch: {}, requestWrapper: jest.fn() })
    ).not.toThrow();
  });
});
