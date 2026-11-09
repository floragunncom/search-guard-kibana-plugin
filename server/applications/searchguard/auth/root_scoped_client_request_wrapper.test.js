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

import { Client, BaseConnection } from '@elastic/elasticsearch';
import {
  rootScopedClientRequestWrapper,
  registerRootScopedClientRequestWrapper,
} from './root_scoped_client_request_wrapper';

const KIBANA_VERSION_INDEX = '.kibana_9.4.3';
const KIBANA_SERVER_AUTH = `Basic ${Buffer.from('kibanaserver:kibanaserver').toString('base64')}`;

// Records the headers that actually leave the transport, without any network.
const sentHeaders = [];
class CapturingConnection extends BaseConnection {
  async request(params) {
    sentHeaders.push({ ...params.headers });
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json', 'x-elastic-product': 'Elasticsearch' },
      body: '{}',
    };
  }
}

// Mirrors Kibana core: one root-scoped client, and asScoped() returns a fresh child per call.
const createClusterClient = () => {
  const rootScopedClient = new Client({
    node: 'http://localhost:9200',
    Connection: CapturingConnection,
  });

  return {
    rootScopedClient,
    asScoped: (request) => ({
      asCurrentUser: rootScopedClient.child({ headers: request.headers }),
    }),
  };
};

const createConfigService = (authType) => ({
  get: (path, defaultValue) =>
    ({
      'searchguard.auth.type': authType,
      elasticsearch: { username: 'kibanaserver', password: 'kibanaserver' },
    }[path] ?? defaultValue),
});

const register = (clusterClient, authType = 'proxy') =>
  registerRootScopedClientRequestWrapper({
    elasticsearch: { client: clusterClient },
    requestWrapper: rootScopedClientRequestWrapper({
      configService: createConfigService(authType),
      kibanaVersionIndex: KIBANA_VERSION_INDEX,
    }),
  });

const requestDefaultSpace = (scopedClient) =>
  scopedClient.transport.request(
    { method: 'GET', path: `/${KIBANA_VERSION_INDEX}/_doc/space%3Adefault` },
    { headers: { authorization: '' } }
  );

describe('registerRootScopedClientRequestWrapper', () => {
  beforeEach(() => {
    sentHeaders.length = 0;
  });

  test('adds a single request listener no matter how often asScoped is called', () => {
    const clusterClient = createClusterClient();
    const { diagnostic } = clusterClient.rootScopedClient;
    const listenersBefore = diagnostic.listenerCount('request');

    register(clusterClient);
    for (let i = 0; i < 10000; i++) {
      clusterClient.asScoped({ headers: {} });
    }

    expect(diagnostic.listenerCount('request')).toBe(listenersBefore + 1);
  });

  test('registers only once per cluster client', () => {
    const clusterClient = createClusterClient();
    const { diagnostic } = clusterClient.rootScopedClient;
    const listenersBefore = diagnostic.listenerCount('request');

    register(clusterClient);
    register(clusterClient);

    expect(diagnostic.listenerCount('request')).toBe(listenersBefore + 1);
  });

  test('still injects the kibana server credentials into whitelisted proxy requests', async () => {
    const clusterClient = createClusterClient();
    register(clusterClient, 'proxy');

    await requestDefaultSpace(clusterClient.asScoped({ headers: {} }).asCurrentUser);

    expect(sentHeaders).toHaveLength(1);
    expect(sentHeaders[0].authorization).toBe(KIBANA_SERVER_AUTH);
  });

  test('covers scoped clients created before the listener was registered', async () => {
    const clusterClient = createClusterClient();
    const earlyClient = clusterClient.asScoped({ headers: {} }).asCurrentUser;
    register(clusterClient, 'proxy');

    await requestDefaultSpace(earlyClient);

    expect(sentHeaders[0].authorization).toBe(KIBANA_SERVER_AUTH);
  });

  test('leaves requests that are not whitelisted untouched', async () => {
    const clusterClient = createClusterClient();
    register(clusterClient, 'proxy');

    await clusterClient
      .asScoped({ headers: {} })
      .asCurrentUser.transport.request(
        { method: 'GET', path: '/some-index/_doc/1' },
        { headers: { authorization: '' } }
      );

    expect(sentHeaders[0].authorization).toBe('');
  });

  test('does not inject credentials for the proxy rule when auth type is not proxy', async () => {
    const clusterClient = createClusterClient();
    register(clusterClient, 'basicauth');

    await requestDefaultSpace(clusterClient.asScoped({ headers: {} }).asCurrentUser);

    expect(sentHeaders[0].authorization).toBe('');
  });

  test('does not override a request that already carries credentials', async () => {
    const clusterClient = createClusterClient();
    register(clusterClient, 'proxy');

    await clusterClient
      .asScoped({ headers: {} })
      .asCurrentUser.transport.request(
        { method: 'GET', path: `/${KIBANA_VERSION_INDEX}/_doc/space%3Adefault` },
        { headers: { authorization: 'Bearer user-token' } }
      );

    expect(sentHeaders[0].authorization).toBe('Bearer user-token');
  });
});
