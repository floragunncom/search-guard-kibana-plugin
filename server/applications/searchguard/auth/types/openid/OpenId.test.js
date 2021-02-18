/* eslint-disable @kbn/eslint/require-license-header */
/**
 *    Copyright 2018 floragunn GmbH

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import { cloneDeep } from 'lodash';
import AuthClass from './OpenId';
import {
  setupSearchGuardBackendMock,
  setupKibanaCoreMock,
  setupConfigMock,
  setupLoggerMock,
  setupSessionStorageMock,
  setupPluginDependenciesMock,
  setupHttpResponseMock,
  setupHttpToolkitMock,
  getCookieExpiryTimeS,
} from '../../../../../utils/mocks';

jest.mock('../../../../../../../../src/core/server/http/router', () => jest.fn());

function setupElasticsearchMock() {
  return jest.fn();
}

const authType = 'openid';

describe(AuthClass.name, () => {
  test('handle ignored routes', async () => {
    const searchGuardBackend = setupSearchGuardBackendMock();
    const kibanaCore = setupKibanaCoreMock();
    const logger = setupLoggerMock();
    const sessionStorage = setupSessionStorageMock();
    const elasticsearch = setupElasticsearchMock();
    const pluginDependencies = setupPluginDependenciesMock();

    const config = setupConfigMock({
      get: jest.fn((path) => {
        if (path === 'searchguard.auth.unauthenticated_routes') {
          return [];
        }
      }),
    });

    const authInstance = new AuthClass({
      searchGuardBackend,
      kibanaCore,
      config,
      logger,
      sessionStorage,
      elasticsearch,
      pluginDependencies,
    });

    const response = setupHttpResponseMock();
    const toolkit = setupHttpToolkitMock();

    const request = {
      url: {
        pathname: '/login',
      },
    };

    const routesToIgnore = [
      '/login',
      '/customerror',
      '/api/core/capabilities',
      '/bootstrap.js',
      '/bundles/app/core/bootstrap.js',
      '/bundles/app/searchguard-customerror/bootstrap.js',
    ];

    for (const route of routesToIgnore) {
      request.url.pathname = route;
      await authInstance.checkAuth(cloneDeep(request), response, toolkit);

      expect(toolkit.notHandled).toHaveBeenCalled();
    }
  });

  test('handle unauthenticated routes', async () => {
    const searchGuardBackend = setupSearchGuardBackendMock();
    const kibanaCore = setupKibanaCoreMock();

    const config = setupConfigMock({
      get: jest.fn((path) => {
        if (path === 'searchguard.auth.unauthenticated_routes') {
          return ['/route/to/ignore/auth/for'];
        }
      }),
    });

    const logger = setupLoggerMock();
    const sessionStorage = setupSessionStorageMock();
    const elasticsearch = setupElasticsearchMock();
    const pluginDependencies = setupPluginDependenciesMock();

    const authInstance = new AuthClass({
      searchGuardBackend,
      kibanaCore,
      config,
      logger,
      sessionStorage,
      elasticsearch,
      pluginDependencies,
    });

    const request = {
      headers: { a: 1 },
      url: {
        pathname: '/route/to/ignore/auth/for',
      },
    };

    const response = setupHttpResponseMock();
    const toolkit = setupHttpToolkitMock();

    await authInstance.checkAuth(cloneDeep(request), response, toolkit);

    expect(toolkit.authenticated).toHaveBeenCalledWith({ requestHeaders: request.headers });
  });

  test('handle unauthenticated request', async () => {
    const searchGuardBackend = setupSearchGuardBackendMock();
    const kibanaCore = setupKibanaCoreMock();
    const logger = setupLoggerMock();
    const elasticsearch = setupElasticsearchMock();
    const pluginDependencies = setupPluginDependenciesMock();

    const config = setupConfigMock({
      get: jest.fn((path) => {
        if (path === 'searchguard.auth.unauthenticated_routes') {
          return [];
        }
      }),
    });

    const sessionStorage = setupSessionStorageMock({
      get: jest.fn(() => null),
    });

    const authInstance = new AuthClass({
      searchGuardBackend,
      kibanaCore,
      config,
      logger,
      sessionStorage,
      elasticsearch,
      pluginDependencies,
    });

    const request = {
      headers: { a: 1 },
      url: {
        pathname: '/',
        path: '/',
      },
    };

    const response = setupHttpResponseMock();
    const toolkit = setupHttpToolkitMock();

    await authInstance.checkAuth(cloneDeep(request), response, toolkit);

    expect(response.redirected).toHaveBeenCalledWith({
      headers: {
        location: '/abc/auth/openid/encode?nextUrl=%2Fabc%2F',
      },
    });
  });

  test('handle authenticated request', async () => {
    const searchGuardBackend = setupSearchGuardBackendMock();
    const kibanaCore = setupKibanaCoreMock();
    const logger = setupLoggerMock();
    const elasticsearch = setupElasticsearchMock();
    const pluginDependencies = setupPluginDependenciesMock();

    const config = setupConfigMock({
      get: jest.fn((path) => {
        if (path === 'searchguard.auth.unauthenticated_routes') return [];
        if (path === 'searchguard.session.ttl') return 3600000;
      }),
    });

    const sessionCookie = {
      username: 'admin',
      credentials: { authHeaderValue: 'Bearer eyJhbGciOiJSUzI1NiIsInR5' },
      authType,
      isAnonymousAuth: false,
      exp: getCookieExpiryTimeS(2),
      additionalAuthHeaders: null,
    };

    const sessionStorageGet = jest.fn(() => cloneDeep(sessionCookie));
    const sessionStorage = setupSessionStorageMock({
      get: sessionStorageGet,
    });

    const authInstance = new AuthClass({
      searchGuardBackend,
      kibanaCore,
      config,
      logger,
      sessionStorage,
      elasticsearch,
      pluginDependencies,
    });

    const request = {
      headers: {
        cookie: 'searchguard_authentication=Fe26.2**925d29ddcc3aba',
      },
      url: {
        pathname: '/app/kibana',
        path: '/app/kibana',
      },
    };

    const response = setupHttpResponseMock();
    const toolkit = setupHttpToolkitMock();

    await authInstance.checkAuth(cloneDeep(request), response, toolkit);

    expect(sessionStorageGet).toHaveBeenCalledWith(request);
    expect(toolkit.authenticated).toHaveBeenCalledWith({
      requestHeaders: { authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5' },
    });
  });

  test('handle authenticated request with expired cookie', async () => {
    const searchGuardBackend = setupSearchGuardBackendMock();
    const kibanaCore = setupKibanaCoreMock();
    const logger = setupLoggerMock();
    const elasticsearch = setupElasticsearchMock();
    const pluginDependencies = setupPluginDependenciesMock();

    const config = setupConfigMock({
      get: jest.fn((path) => {
        if (path === 'searchguard.auth.unauthenticated_routes') return [];
        if (path === 'searchguard.session.ttl') return 3600000;
      }),
    });

    const sessionCookie = {
      username: 'admin',
      credentials: { authHeaderValue: 'Bearer eyJhbGciOiJSUzI1NiIsInR5' },
      authType,
      isAnonymousAuth: false,
      exp: getCookieExpiryTimeS(-2),
      additionalAuthHeaders: null,
    };

    const sessionStorageGet = jest.fn(() => cloneDeep(sessionCookie));
    const sessionStorageClear = jest.fn();
    const sessionStorage = setupSessionStorageMock({
      get: sessionStorageGet,
      clear: sessionStorageClear,
    });

    const authInstance = new AuthClass({
      searchGuardBackend,
      kibanaCore,
      config,
      logger,
      sessionStorage,
      elasticsearch,
      pluginDependencies,
    });

    const request = {
      headers: {
        cookie: 'searchguard_authentication=Fe26.2**925d29ddcc3aba',
      },
      url: {
        pathname: '/app/kibana',
        path: '/app/kibana',
      },
    };

    const response = setupHttpResponseMock();
    const toolkit = setupHttpToolkitMock();

    await authInstance.checkAuth(cloneDeep(request), response, toolkit);

    expect(sessionStorageGet).toHaveBeenCalledWith(request);
    expect(sessionStorageClear).toHaveBeenCalledWith(request);
    expect(response.redirected).toHaveBeenCalledWith({
      headers: {
        location: '/abc/auth/openid/encode?nextUrl=%2Fabc%2Fapp%2Fkibana',
      },
    });
  });
});
