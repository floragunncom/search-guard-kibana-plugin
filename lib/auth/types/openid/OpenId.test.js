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
} from '../../mocks';

jest.mock('../../../../../../src/core/server/http/router', () => jest.fn());

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
      await authInstance.checkAuth(request, response, toolkit);

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

    await authInstance.checkAuth(request, response, toolkit);

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

    await authInstance.checkAuth(request, response, toolkit);

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

    const sessionStorageFactoryGet = jest.fn(() => sessionCookie);
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

    await authInstance.checkAuth(request, response, toolkit);

    expect(sessionStorageFactory.asScoped).toHaveBeenCalledWith(request);
    expect(sessionStorageFactoryGet).toHaveBeenCalledTimes(1);
    expect(toolkit.authenticated).toHaveBeenCalledWith({
      requestHeaders: { authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5' },
    });
  });

  test('handle authenticated request (Multitenancy)', async () => {
    const kibanaCore = setupKibanaCoreMock();
    const logger = setupLoggerMock();
    const elasticsearch = setupElasticsearchMock();
    const pluginDependencies = setupPluginDependenciesMock();

    const sgtenant = '__user__';
    const authinfoValue = {
      user: 'User [name=admin, backend_roles=[admin], requestedTenant=null]',
      user_name: 'admin',
      user_requested_tenant: null,
      remote_address: '127.0.0.1:51476',
      backend_roles: ['admin'],
      custom_attribute_names: [],
      attribute_names: [],
      sg_roles: ['SGS_ALL_ACCESS', 'SGS_OWN_INDEX'],
      sg_tenants: { admin_tenant: true, admin: true, SGS_GLOBAL_TENANT: true },
      principal: null,
      peer_certificates: '0',
      sso_logout_url: null,
    };

    const searchGuardBackend = setupSearchGuardBackendMock({
      authinfo: jest.fn().mockResolvedValue(authinfoValue),
      validateTenant: jest.fn().mockReturnValue(sgtenant),
    });

    const config = setupConfigMock({
      get: jest.fn((path) => {
        if (path === 'searchguard.auth.unauthenticated_routes') return [];
        if (path === 'searchguard.multitenancy.enabled') return true;
        if (path === 'searchguard.multitenancy.tenants.enable_global') return false;
        if (path === 'searchguard.multitenancy.tenants.enable_private') return true;
        if (path === 'searchguard.multitenancy.tenants.preferred') return ['private'];
        if (path === 'searchguard.multitenancy.debug') return false;
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
      tenant: sgtenant,
    };

    const sessionStorageFactoryGet = jest.fn(() => sessionCookie);
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

    await authInstance.checkAuth(request, response, toolkit);

    const authHeaders = { authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5', sgtenant };

    // TODO: Test handleDefaultSpace function execution in .checkAuth.
    expect(sessionStorageFactory.asScoped).toHaveBeenCalledWith(request);
    expect(sessionStorageFactoryGet).toHaveBeenCalledTimes(1);
    expect(searchGuardBackend.authinfo).toHaveBeenCalledWith(authHeaders);
    expect(searchGuardBackend.validateTenant).toHaveBeenCalledWith(
      authinfoValue.user_name,
      sgtenant,
      authinfoValue.sg_tenants,
      false,
      true
    );
    expect(toolkit.authenticated).toHaveBeenCalledWith({
      requestHeaders: authHeaders,
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

    const sessionStorageFactoryGet = jest.fn(() => sessionCookie);
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

    await authInstance.checkAuth(request, response, toolkit);

    expect(sessionStorageFactory.asScoped).toHaveBeenCalledWith(request);
    expect(sessionStorageFactoryGet).toHaveBeenCalledTimes(2);

    const clearedSessionCookie = { ...sessionCookie };
    delete clearedSessionCookie.credentials;
    expect(sessionStorageFactorySet).toHaveBeenCalledWith(clearedSessionCookie);

    expect(response.redirected).toHaveBeenCalledWith({
      headers: {
        location: '/abc/auth/openid/login?nextUrl=%2Fabc%2Fapp%2Fkibana',
      },
    });
  });
});
