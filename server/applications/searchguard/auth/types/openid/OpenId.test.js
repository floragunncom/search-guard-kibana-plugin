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
  setupSessionStorageFactoryMock,
  setupElasticsearchMock,
  setupPluginDependenciesMock,
  setupHttpResponseMock,
  setupHttpToolkitMock,
  getCookieExpiryTimeS,
} from '../../../../../utils/mocks';

jest.mock('../../../../../../../../src/core/server/http/router', () => jest.fn());

const authType = 'openid';

describe(AuthClass.name, () => {
  test('handle ignored routes', async () => {
    const searchGuardBackend = setupSearchGuardBackendMock();
    const kibanaCore = setupKibanaCoreMock();
    const logger = setupLoggerMock();
    const sessionStorageFactory = setupSessionStorageFactoryMock();
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
      sessionStorageFactory,
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
    const sessionStorageFactory = setupSessionStorageFactoryMock();
    const elasticsearch = setupElasticsearchMock();
    const pluginDependencies = setupPluginDependenciesMock();

    const authInstance = new AuthClass({
      searchGuardBackend,
      kibanaCore,
      config,
      logger,
      sessionStorageFactory,
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

    const sessionStorageFactory = setupSessionStorageFactoryMock({
      asScoped: jest.fn(() => ({
        get: jest.fn(() => null),
      })),
    });

    const authInstance = new AuthClass({
      searchGuardBackend,
      kibanaCore,
      config,
      logger,
      sessionStorageFactory,
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

    expect(sessionStorageFactory.asScoped).toHaveBeenCalledWith(request);
    expect(response.redirected).toHaveBeenCalledWith({
      headers: {
        location: '/abc/auth/openid/login?nextUrl=%2Fabc%2F',
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
      exp: getCookieExpiryTimeS(1),
      additionalAuthHeaders: null,
    };

    const sessionStorageFactoryGet = jest.fn(() => cloneDeep(sessionCookie));
    const sessionStorageFactory = setupSessionStorageFactoryMock({
      asScoped: jest.fn(() => ({
        get: sessionStorageFactoryGet,
      })),
    });

    const authInstance = new AuthClass({
      searchGuardBackend,
      kibanaCore,
      config,
      logger,
      sessionStorageFactory,
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

    expect(sessionStorageFactory.asScoped).toHaveBeenCalledWith(request);
    expect(sessionStorageFactoryGet).toHaveBeenCalledTimes(1);
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
      exp: getCookieExpiryTimeS(-1),
      additionalAuthHeaders: null,
    };

    const sessionStorageFactoryGet = jest.fn(() => cloneDeep(sessionCookie));
    const sessionStorageFactorySet = jest.fn();
    const sessionStorageFactory = setupSessionStorageFactoryMock({
      asScoped: jest.fn(() => ({
        get: sessionStorageFactoryGet,
        set: sessionStorageFactorySet,
      })),
    });

    const authInstance = new AuthClass({
      searchGuardBackend,
      kibanaCore,
      config,
      logger,
      sessionStorageFactory,
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

    const clearedSessionCookie = {
      exp: getCookieExpiryTimeS(-1),
    };

    expect(sessionStorageFactory.asScoped).toHaveBeenCalledWith(request);
    expect(sessionStorageFactoryGet).toHaveBeenCalledTimes(2);
    expect(sessionStorageFactorySet).toHaveBeenCalledWith(clearedSessionCookie);
    expect(response.redirected).toHaveBeenCalledWith({
      headers: {
        location: '/abc/auth/openid/login?nextUrl=%2Fabc%2Fapp%2Fkibana',
      },
    });
  });
});
