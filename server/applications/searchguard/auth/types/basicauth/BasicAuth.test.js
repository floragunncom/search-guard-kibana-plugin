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
import AuthClass from './BasicAuth';
import {
  setupSearchGuardBackendMock,
  setupKibanaCoreMock,
  setupConfigMock,
  setupLoggerMock,
  setupSessionStorageFactoryMock,
  setupPluginDependenciesMock,
  setupHttpResponseMock,
  setupHttpToolkitMock,
  getCookieExpiryTimeMS,
} from '../../../../../utils/mocks';

const authType = 'basicauth';
const authHeaderName = 'authorization';

describe(AuthClass.name, () => {
  test('handle ignored routes', async () => {
    const searchGuardBackend = setupSearchGuardBackendMock();
    const kibanaCore = setupKibanaCoreMock();
    const logger = setupLoggerMock();
    const sessionStorageFactory = setupSessionStorageFactoryMock();
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

      expect(kibanaCore.http.registerOnPreResponse).toHaveBeenCalled();
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
    const pluginDependencies = setupPluginDependenciesMock();

    const authInstance = new AuthClass({
      searchGuardBackend,
      kibanaCore,
      config,
      logger,
      sessionStorageFactory,
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

    expect(kibanaCore.http.registerOnPreResponse).toHaveBeenCalledTimes(1);
    expect(toolkit.authenticated).toHaveBeenCalledWith({ requestHeaders: request.headers });
  });

  test('redirect to the login page if unauthenticated request', async () => {
    const searchGuardBackend = setupSearchGuardBackendMock();
    const kibanaCore = setupKibanaCoreMock();
    const logger = setupLoggerMock();
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
      pluginDependencies,
    });

    const request = {
      headers: { a: 1 },
      route: { path: '' },
      url: {
        pathname: '/api/v1/searchguard/kibana_config',
      },
    };

    const response = setupHttpResponseMock();
    const toolkit = setupHttpToolkitMock();

    await authInstance.checkAuth(cloneDeep(request), response, toolkit);

    expect(kibanaCore.http.registerOnPreResponse).toHaveBeenCalledTimes(1);
    expect(sessionStorageFactory.asScoped).toHaveBeenCalledWith(request);
    expect(response.redirected).toHaveBeenCalledWith({
      headers: {
        location: '/abc/login?nextUrl=%2Fabc%2Fapi%2Fv1%2Fsearchguard%2Fkibana_config',
      },
    });
  });

  test('handle authenticated request', async () => {
    const searchGuardBackend = setupSearchGuardBackendMock();
    const kibanaCore = setupKibanaCoreMock();
    const logger = setupLoggerMock();
    const pluginDependencies = setupPluginDependenciesMock();

    const sessionTTL = 3600000;
    const config = setupConfigMock({
      get: jest.fn((path) => {
        if (path === 'searchguard.auth.unauthenticated_routes') return [];
        if (path === 'searchguard.session.ttl') return sessionTTL;
        if (path === 'searchguard.session.keepalive') return true;
      }),
    });

    const sessionCookie = {
      username: 'admin',
      credentials: { authHeaderValue: 'Basic YWRtaW46YWRtaW4=' },
      authType,
      isAnonymousAuth: false,
      expiryTime: getCookieExpiryTimeMS(1),
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
      pluginDependencies,
    });

    const request = {
      headers: {
        cookie: 'searchguard_authentication=Fe26.2**925d29ddcc3aba',
        authorization: 'Basic YWRtaW46YWRtaW4=',
      },
      url: {
        pathname: '/api/v1/searchguard/kibana_config',
      },
    };

    const response = setupHttpResponseMock();
    const toolkit = setupHttpToolkitMock();

    await authInstance.checkAuth(cloneDeep(request), response, toolkit);

    expect(kibanaCore.http.registerOnPreResponse).toHaveBeenCalledTimes(1);
    expect(sessionStorageFactory.asScoped).toHaveBeenCalledWith(request);
    expect(sessionStorageFactoryGet).toHaveBeenCalledTimes(1);
    expect(sessionStorageFactorySet).toHaveBeenCalledWith({
      ...sessionCookie,
      // If sessionTTL, cookie expiryTime set to Date.now() + sessionTTL.
      // We test it in the next expect line.
      expiryTime: expect.any(Number),
    });
    expect(sessionStorageFactorySet.mock.calls[0][0].expiryTime).toBeLessThanOrEqual(
      Date.now() + sessionTTL
    );
    expect(toolkit.authenticated).toHaveBeenCalledWith({
      requestHeaders: { authorization: 'Basic YWRtaW46YWRtaW4=' },
    });
  });

  test('handle authenticated request with expired cookie', async () => {
    const searchGuardBackend = setupSearchGuardBackendMock();
    const kibanaCore = setupKibanaCoreMock();
    const logger = setupLoggerMock();
    const pluginDependencies = setupPluginDependenciesMock();

    const config = setupConfigMock({
      get: jest.fn((path) => {
        if (path === 'searchguard.auth.unauthenticated_routes') return [];
        if (path === 'searchguard.session.ttl') return 3600000;
      }),
    });

    const sessionCookie = {
      username: 'admin',
      credentials: { authHeaderValue: 'Basic YWRtaW46YWRtaW4=' },
      authType,
      isAnonymousAuth: false,
      expiryTime: getCookieExpiryTimeMS(-1),
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
      pluginDependencies,
    });

    const request = {
      headers: {
        cookie: 'searchguard_authentication=Fe26.2**925d29ddcc3aba',
      },
      url: {
        pathname: '/api/v1/searchguard/kibana_config',
      },
    };

    const response = setupHttpResponseMock();
    const toolkit = setupHttpToolkitMock();

    await authInstance.checkAuth(cloneDeep(request), response, toolkit);

    const clearedSessionCookie = {
      expiryTime: sessionCookie.expiryTime,
    };

    expect(kibanaCore.http.registerOnPreResponse).toHaveBeenCalledTimes(1);
    expect(sessionStorageFactory.asScoped).toHaveBeenCalledWith(request);
    expect(sessionStorageFactoryGet).toHaveBeenCalledTimes(2);
    expect(sessionStorageFactorySet).toHaveBeenCalledWith(clearedSessionCookie);
    expect(response.redirected).toHaveBeenCalledWith({
      headers: {
        location: '/abc/login?nextUrl=%2Fabc%2Fapi%2Fv1%2Fsearchguard%2Fkibana_config',
      },
    });
  });

  test('handle authenticated request with invalid cookie type', async () => {
    const searchGuardBackend = setupSearchGuardBackendMock();
    const kibanaCore = setupKibanaCoreMock();
    const logger = setupLoggerMock();
    const pluginDependencies = setupPluginDependenciesMock();

    const config = setupConfigMock({
      get: jest.fn((path) => {
        if (path === 'searchguard.auth.unauthenticated_routes') return [];
        if (path === 'searchguard.session.ttl') return 3600000;
      }),
    });

    const sessionCookie = {
      username: 'admin',
      credentials: { authHeaderValue: 'Basic YWRtaW46YWRtaW4=' },
      authType: 'invalid type',
      isAnonymousAuth: false,
      expiryTime: getCookieExpiryTimeMS(1),
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
      pluginDependencies,
    });

    const request = {
      headers: {
        cookie: 'searchguard_authentication=Fe26.2**925d29ddcc3aba',
        accept: 'application/json',
        'content-type': ['application/json'],
      },
      url: {
        pathname: '/api/v1/searchguard/kibana_config',
      },
    };

    const response = setupHttpResponseMock();
    const toolkit = setupHttpToolkitMock();

    await authInstance.checkAuth(cloneDeep(request), response, toolkit);

    const clearedSessionCookie = {
      expiryTime: sessionCookie.expiryTime,
    };

    expect(kibanaCore.http.registerOnPreResponse).toHaveBeenCalledTimes(1);
    expect(sessionStorageFactory.asScoped).toHaveBeenCalledWith(request);
    expect(sessionStorageFactoryGet).toHaveBeenCalledTimes(2);
    expect(sessionStorageFactorySet).toHaveBeenCalledWith(clearedSessionCookie);
    expect(response.unauthorized).toHaveBeenCalledWith({
      body: {
        message: 'Session expired',
      },
      headers: {
        sg_redirectTo: '/abc/login',
      },
    });
  });

  test('handle authenticated request if credentials are only in headers', async () => {
    const kibanaCore = setupKibanaCoreMock();
    const logger = setupLoggerMock();
    const pluginDependencies = setupPluginDependenciesMock();

    const user = {
      username: 'admin',
      tenants: ['admin'],
      roles: ['SGS_ALL_ACCESS'],
    };

    const authenticateWithHeader = jest.fn().mockResolvedValue(cloneDeep(user));
    const searchGuardBackend = setupSearchGuardBackendMock({
      authenticateWithHeader,
    });

    const sessionTTL = 3600000;
    const config = setupConfigMock({
      get: jest.fn((path) => {
        if (path === 'searchguard.auth.unauthenticated_routes') return [];
        if (path === 'searchguard.multitenancy.enabled') return true;
        if (path === 'searchguard.multitenancy.tenants.enable_global') return true;
        if (path === 'searchguard.multitenancy.tenants.enable_private') return true;
        if (path === 'searchguard.session.ttl') return sessionTTL;
      }),
    });

    const sessionCookie = {
      username: 'admin',
      authType,
      isAnonymousAuth: false,
      expiryTime: getCookieExpiryTimeMS(1),
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
      pluginDependencies,
    });

    const request = {
      headers: {
        cookie: 'searchguard_authentication=Fe26.2**925d29ddcc3aba',
        authorization: 'Basic YWRtaW46YWRtaW4=',
        sgtenant: '__user__',
      },
      url: {
        pathname: '/api/v1/searchguard/kibana_config',
      },
    };
    const additionalAuthHeaders = {};

    const response = setupHttpResponseMock();
    const toolkit = setupHttpToolkitMock();

    await authInstance.checkAuth(cloneDeep(request), response, toolkit);

    expect(sessionStorageFactory.asScoped).toHaveBeenCalledWith(request);
    expect(sessionStorageFactoryGet).toHaveBeenCalledTimes(1);
    expect(authenticateWithHeader).toHaveBeenCalledWith(
      authHeaderName,
      request.headers.authorization,
      additionalAuthHeaders
    );
    expect(sessionStorageFactorySet).toHaveBeenCalledWith({
      ...sessionCookie,
      credentials: { authHeaderValue: request.headers.authorization },
      // If sessionTTL, cookie expiryTime set to Date.now() + sessionTTL.
      // We test it in the next expect line.
      expiryTime: expect.any(Number),
    });
    expect(sessionStorageFactorySet.mock.calls[0][0].expiryTime).toBeLessThanOrEqual(
      Date.now() + sessionTTL
    );
    expect(toolkit.authenticated).toHaveBeenCalledWith({
      requestHeaders: { authorization: request.headers.authorization },
    });
  });

  test('handle unauthenticated request (asynchronous)', async () => {
    const kibanaCore = setupKibanaCoreMock();
    const logger = setupLoggerMock();
    const pluginDependencies = setupPluginDependenciesMock();
    const response = setupHttpResponseMock();
    const toolkit = setupHttpToolkitMock();

    const config = setupConfigMock({
      get: jest.fn((path) => {
        if (path === 'searchguard.auth.unauthenticated_routes') return [];
        if (path === 'searchguard.session.ttl') return 3600000;
      }),
    });

    const user = {
      username: 'admin',
      tenants: ['admin'],
      roles: ['SGS_ALL_ACCESS'],
    };

    const authenticateWithHeader = jest.fn().mockResolvedValue(cloneDeep(user));
    const searchGuardBackend = setupSearchGuardBackendMock({
      authenticateWithHeader,
    });

    const sessionCookie = {
      username: 'admin',
      authType,
      isAnonymousAuth: false,
      expiryTime: getCookieExpiryTimeMS(1),
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
      pluginDependencies,
    });

    const request = {
      headers: {
        cookie: 'searchguard_authentication=Fe26.2**925d29ddcc3aba',
        accept: 'applicatiom/json',
        'content-type': ['application/json'],
      },
      route: {
        path: '/api/v1/searchguard/kibana_config',
      },
      url: {
        pathname: '/api/v1/searchguard/kibana_config',
      },
    };

    await authInstance.checkAuth(cloneDeep(request), response, toolkit);

    expect(kibanaCore.http.registerOnPreResponse).toHaveBeenCalledTimes(1);
    expect(sessionStorageFactory.asScoped).toHaveBeenCalledWith(request);
    expect(sessionStorageFactoryGet).toHaveBeenCalledTimes(1);
    expect(response.unauthorized).toHaveBeenCalledWith({
      body: {
        message: 'Session expired',
      },
      headers: {
        sg_redirectTo: '/abc/login',
      },
    });
  });

  test('handle request that has auth header credentials different from the cookie credentials', async () => {
    const kibanaCore = setupKibanaCoreMock();
    const logger = setupLoggerMock();
    const pluginDependencies = setupPluginDependenciesMock();

    const sessionTTL = 3600000;
    const config = setupConfigMock({
      get: jest.fn((path) => {
        if (path === 'searchguard.auth.unauthenticated_routes') return [];
        if (path === 'searchguard.session.ttl') return sessionTTL;
        if (path === 'searchguard.basicauth.header_trumps_session') return true;
      }),
    });

    const user = {
      username: 'admin',
      tenants: ['admin'],
      roles: ['SGS_ALL_ACCESS'],
    };

    const authenticateWithHeader = jest.fn().mockResolvedValue(cloneDeep(user));
    const searchGuardBackend = setupSearchGuardBackendMock({
      authenticateWithHeader,
    });

    const sessionCookie = {
      username: 'admin',
      credentials: { authHeaderValue: 'Different' },
      authType,
      isAnonymousAuth: false,
      expiryTime: getCookieExpiryTimeMS(1),
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
      pluginDependencies,
    });

    const request = {
      headers: {
        cookie: 'searchguard_authentication=Fe26.2**925d29ddcc3aba',
        authorization: 'Basic YWRtaW46YWRtaW4=',
      },
      url: {
        pathname: '/api/v1/searchguard/kibana_config',
      },
    };
    const additionalAuthHeaders = {};

    const response = setupHttpResponseMock();
    const toolkit = setupHttpToolkitMock();

    await authInstance.checkAuth(cloneDeep(request), response, toolkit);

    expect(kibanaCore.http.registerOnPreResponse).toHaveBeenCalledTimes(1);
    expect(sessionStorageFactory.asScoped).toHaveBeenCalledWith(request);
    expect(sessionStorageFactoryGet).toHaveBeenCalledTimes(1);
    expect(authenticateWithHeader).toHaveBeenCalledWith(
      authHeaderName,
      request.headers.authorization,
      additionalAuthHeaders
    );
    expect(sessionStorageFactorySet).toHaveBeenCalledWith({
      ...sessionCookie,
      credentials: { authHeaderValue: request.headers.authorization },
      // If sessionTTL, cookie expiryTime set to Date.now() + sessionTTL.
      // We test it in the next expect line.
      expiryTime: expect.any(Number),
    });
    expect(sessionStorageFactorySet.mock.calls[0][0].expiryTime).toBeLessThanOrEqual(
      Date.now() + sessionTTL
    );
    expect(toolkit.authenticated).toHaveBeenCalledWith({
      requestHeaders: { authorization: request.headers.authorization },
    });
  });

  describe('handle additional headers validation', () => {
    let kibanaCore;
    let logger;
    let pluginDependencies;
    let response;
    let toolkit;
    let sessionTTL;
    let config;
    let user;
    let authenticateWithHeader;
    let searchGuardBackend;

    beforeEach(() => {
      kibanaCore = setupKibanaCoreMock();
      logger = setupLoggerMock();
      pluginDependencies = setupPluginDependenciesMock();
      response = setupHttpResponseMock();
      toolkit = setupHttpToolkitMock();

      sessionTTL = 3600000;
      config = setupConfigMock({
        get: jest.fn((path) => {
          if (path === 'searchguard.auth.unauthenticated_routes') return [];
          if (path === 'searchguard.session.ttl') return sessionTTL;
          if (path === 'searchguard.basicauth.header_trumps_session') return false;
        }),
      });

      user = {
        username: 'admin',
        tenants: ['admin'],
        roles: ['SGS_ALL_ACCESS'],
      };

      authenticateWithHeader = jest.fn().mockResolvedValue(cloneDeep(user));
      searchGuardBackend = setupSearchGuardBackendMock({
        authenticateWithHeader,
      });
    });

    test('conflicting header values', async () => {
      const sessionCookie = {
        username: 'admin',
        credentials: { authHeaderValue: 'Basic YWRtaW46YWRtaW4=' },
        authType,
        isAnonymousAuth: false,
        expiryTime: getCookieExpiryTimeMS(1),
        additionalAuthHeaders: { sg_impersonate_as: 'any', a: 'b' },
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
        pluginDependencies,
      });

      const request = {
        headers: {
          cookie: 'searchguard_authentication=Fe26.2**925d29ddcc3aba',
          authorization: 'Basic YWRtaW46YWRtaW4=',
          sg_impersonate_as: 'any',
        },
        url: {
          pathname: '/api/v1/searchguard/kibana_config',
        },
      };

      await authInstance.checkAuth(cloneDeep(request), response, toolkit);

      expect(kibanaCore.http.registerOnPreResponse).toHaveBeenCalledTimes(1);
      expect(sessionStorageFactory.asScoped).toHaveBeenCalledWith(request);
      expect(sessionStorageFactoryGet).toHaveBeenCalledTimes(2);
      expect(sessionStorageFactorySet).toHaveBeenCalledWith({
        expiryTime: sessionCookie.expiryTime,
      });
      expect(response.redirected).toHaveBeenCalledWith({
        headers: {
          location: '/abc/login?nextUrl=%2Fabc%2Fapi%2Fv1%2Fsearchguard%2Fkibana_config',
        },
      });
    });

    test('headers found are not in the session cookie', async () => {
      const sessionCookie = {
        username: 'admin',
        credentials: { authHeaderValue: 'Basic YWRtaW46YWRtaW4=' },
        authType,
        isAnonymousAuth: false,
        expiryTime: getCookieExpiryTimeMS(1),
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
        pluginDependencies,
      });

      const request = {
        headers: {
          cookie: 'searchguard_authentication=Fe26.2**925d29ddcc3aba',
          authorization: 'Basic YWRtaW46YWRtaW4=',
          sg_impersonate_as: 'any',
        },
        url: {
          pathname: '/api/v1/searchguard/kibana_config',
        },
      };

      await authInstance.checkAuth(cloneDeep(request), response, toolkit);

      expect(kibanaCore.http.registerOnPreResponse).toHaveBeenCalledTimes(1);
      expect(sessionStorageFactory.asScoped).toHaveBeenCalledWith(request);
      expect(sessionStorageFactoryGet).toHaveBeenCalledTimes(2);
      expect(sessionStorageFactorySet).toHaveBeenCalledWith({
        expiryTime: sessionCookie.expiryTime,
      });
      expect(response.redirected).toHaveBeenCalledWith({
        headers: {
          location: '/abc/login?nextUrl=%2Fabc%2Fapi%2Fv1%2Fsearchguard%2Fkibana_config',
        },
      });
    });
  });

  describe('handle the Kibana capabilities', () => {
    let searchGuardBackend;
    let kibanaCore;
    let logger;
    let pluginDependencies;
    let response;
    let toolkit;
    let config;
    let sessionStorageFactory;

    beforeEach(() => {
      searchGuardBackend = setupSearchGuardBackendMock();
      kibanaCore = setupKibanaCoreMock();
      logger = setupLoggerMock();
      pluginDependencies = setupPluginDependenciesMock();
      response = setupHttpResponseMock();
      toolkit = setupHttpToolkitMock();
      config = setupConfigMock({
        get: jest.fn((path) => {
          if (path === 'searchguard.auth.unauthenticated_routes') {
            return [];
          }
        }),
      });
      sessionStorageFactory = setupSessionStorageFactoryMock({
        asScoped: jest.fn(() => ({
          get: jest.fn(() => null),
        })),
      });
    });

    test('if Kibana requests capabilities without authorization, redirect the call to our route to serve the default capabilities', async () => {
      const authInstance = new AuthClass({
        searchGuardBackend,
        kibanaCore,
        config,
        logger,
        sessionStorageFactory,
        pluginDependencies,
      });

      const request = {
        headers: {}, // no authorization
        route: { path: '/api/core/capabilities' },
      };

      const resp = await authInstance.onPostAuth(cloneDeep(request), response, toolkit);
      expect(resp).toEqual({
        options: {
          headers: {
            location: '/abc/api/v1/searchguard/kibana_capabilities',
          },
        },
        payload: undefined, // The payload is passed together with the redirect despite of the undefined here
        status: 307,
      });
    });

    test('do not redirect if the request contains authorization', async () => {
      const sessionCookie = {
        username: 'admin',
        credentials: { authHeaderValue: 'Basic YWRtaW46YWRtaW4=' },
        authType,
        isAnonymousAuth: false,
        expiryTime: getCookieExpiryTimeMS(1),
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

      const request = {
        headers: {
          cookie: 'searchguard_authentication=Fe26.2**925d29ddcc3aba',
          authorization: 'Basic YWRtaW46YWRtaW4=',
        },
        route: { path: '/api/core/capabilities' },
      };

      toolkit = setupHttpToolkitMock({ next: jest.fn(() => 'next') });

      const authInstance = new AuthClass({
        searchGuardBackend,
        kibanaCore,
        config,
        logger,
        sessionStorageFactory,
        pluginDependencies,
      });

      const resp = await authInstance.onPostAuth(cloneDeep(request), response, toolkit);

      expect(toolkit.next).toHaveBeenCalledTimes(1);
      expect(resp).toBe('next');
    });
  });
});
