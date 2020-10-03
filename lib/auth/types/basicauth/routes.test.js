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

import BasicAuth from './BasicAuth';
import { loginHandler, loginAuthHandler, logoutHandler } from './routes';
import {
  setupSearchGuardBackendMock,
  setupConfigMock,
  setupLoggerMock,
  setupSessionStorageFactoryMock,
  setupHttpResponseMock,
  setupAuthInstanceMock,
  setupContextMock,
} from '../../mocks';
import { AuthenticationError, MissingTenantError, MissingRoleError } from '../../errors';

describe(`${BasicAuth.name} routes`, () => {
  describe('loginHandler', () => {
    test('unauthenticated request', async () => {
      const context = setupContextMock();
      const response = setupHttpResponseMock();
      const config = setupConfigMock();
      const authInstance = setupAuthInstanceMock();
      const logger = setupLoggerMock();

      const request = {
        headers: {},
        url: {
          search: '?nextUrl=%2Fapp%2Fhome',
          query: { nextUrl: '/app/home' },
          pathname: '/login',
          path: '/login?nextUrl=%2Fapp%2Fhome',
          href: '/login?nextUrl=%2Fapp%2Fhome',
        },
      };

      await loginHandler({ config, authInstance, logger })(context, request, response);

      expect(response.renderAnonymousCoreApp).toHaveBeenCalledTimes(1);
    });
  });

  describe('loginAuthHandler', () => {
    test('throw error', async () => {
      const context = setupContextMock();
      const response = setupHttpResponseMock();
      const logger = setupLoggerMock();
      const searchGuardBackend = setupSearchGuardBackendMock();
      const sessionStorageFactory = setupSessionStorageFactoryMock();

      const config = setupConfigMock({
        get: jest.fn((path) => {
          if (path === 'searchguard.basicauth') return {};
          if (path === 'searchguard.multitenancy.enabled') return false;
        }),
      });

      const authHeaderValue = 'Basic YWRtaW46YWRtaW4=';

      const errors = [
        {
          message: 'nasty!',
          error: new Error('nasty!'),
          statusCode: 500,
        },
        {
          message: 'nasty!',
          error: new AuthenticationError('nasty!'),
          statusCode: 401,
        },
        {
          message: 'nasty!',
          error: new MissingRoleError('nasty!'),
          statusCode: 404,
        },
        {
          message: 'nasty!',
          error: new MissingTenantError('nasty!'),
          statusCode: 404,
        },
      ];

      for (let i = 0; i < errors.length; i++) {
        const { error, message: errorMessage, statusCode: errorStatusCode } = errors[i];
        const handleAuthenticate = jest.fn().mockRejectedValue(error);
        const authInstance = setupAuthInstanceMock({
          handleAuthenticate,
        });

        const request = {
          headers: {},
          body: { username: 'admin', password: 'admin' },
          url: {
            pathname: '/api/v1/auth/login',
            path: '/api/v1/auth/login',
            href: '/api/v1/auth/login',
          },
        };

        try {
          await loginAuthHandler({
            config,
            authInstance,
            logger,
            searchGuardBackend,
            sessionStorageFactory,
          })(context, request, response);
        } catch (e) {
          expect(logger.error).toHaveBeenCalledWith(`Basic auth login authorization ${error}`);
          expect(authInstance.handleAuthenticate).toHaveBeenCalledWith(request, {
            authHeaderValue,
          });
          expect(e.output.statusCode).toBe(errorStatusCode);
          expect(e.message).toBe(errorMessage);
        }
      }
    });

    test('authenticate a user', async () => {
      const context = setupContextMock();
      const response = setupHttpResponseMock();
      const logger = setupLoggerMock();
      const searchGuardBackend = setupSearchGuardBackendMock();
      const sessionStorageFactory = setupSessionStorageFactoryMock();

      const config = setupConfigMock({
        get: jest.fn((path) => {
          if (path === 'searchguard.basicauth') return {};
          if (path === 'searchguard.multitenancy.enabled') return false;
        }),
      });

      const authHeaderValue = 'Basic YWRtaW46YWRtaW4=';
      const handleAuthenticateResponse = {
        user: {
          username: 'admin',
          credentials: {
            headerName: 'authorization',
            headerValue: authHeaderValue,
          },
          proxyCredentials: null,
          roles: ['SGS_ALL_ACCESS', 'SGS_OWN_INDEX'],
          selectedTenant: null,
          backendroles: ['admin'],
          tenants: {
            admin_tenant: true,
            admin: true,
            SGS_GLOBAL_TENANT: true,
          },
        },
        session: {
          username: 'admin',
          credentials: { authHeaderValue },
          authType: 'basicauth',
          isAnonymousAuth: false,
          expiryTime: 1601644464135,
          additionalAuthHeaders: null,
        },
      };
      const { user } = handleAuthenticateResponse;

      const authInstance = setupAuthInstanceMock({
        handleAuthenticate: jest.fn().mockResolvedValue(handleAuthenticateResponse),
      });

      const request = {
        headers: {},
        body: { username: 'admin', password: 'admin' },
        url: {
          pathname: '/api/v1/auth/login',
          path: '/api/v1/auth/login',
          href: '/api/v1/auth/login',
        },
      };

      await loginAuthHandler({
        config,
        authInstance,
        logger,
        searchGuardBackend,
        sessionStorageFactory,
      })(context, request, response);

      expect(authInstance.handleAuthenticate).toHaveBeenCalledWith(request, { authHeaderValue });
      expect(response.ok).toHaveBeenCalledWith({
        body: {
          username: user.username,
          tenants: user.tenants,
        },
      });
    });

    test('authenticate a user (Multitenancy)', async () => {
      const context = setupContextMock();
      const response = setupHttpResponseMock();
      const logger = setupLoggerMock();

      const preferredTenants = undefined;
      const globalTenantEnabled = true;
      const privateTenantEnabled = true;
      const config = setupConfigMock({
        get: jest.fn((path) => {
          if (path === 'searchguard.basicauth') return {};
          if (path === 'searchguard.multitenancy.enabled') return true;
          if (path === 'searchguard.multitenancy.tenants.preferred') return preferredTenants;
          if (path === 'searchguard.multitenancy.tenants.enable_global') return globalTenantEnabled;
          if (path === 'searchguard.multitenancy.tenants.enable_private')
            return privateTenantEnabled;
        }),
      });

      const sgtenant = '__user__';
      const authHeaderValue = 'Basic YWRtaW46YWRtaW4=';
      const handleAuthenticateResponse = {
        user: {
          username: 'admin',
          credentials: {
            headerName: 'authorization',
            headerValue: authHeaderValue,
          },
          proxyCredentials: null,
          roles: ['SGS_ALL_ACCESS', 'SGS_OWN_INDEX'],
          selectedTenant: null,
          backendroles: ['admin'],
          tenants: {
            admin_tenant: true,
            admin: true,
            SGS_GLOBAL_TENANT: true,
          },
        },
        session: {
          username: 'admin',
          credentials: { authHeaderValue },
          authType: 'basicauth',
          isAnonymousAuth: false,
          expiryTime: 1601644464135,
          additionalAuthHeaders: null,
        },
      };
      const { user, session } = handleAuthenticateResponse;

      const authInstance = setupAuthInstanceMock({
        handleAuthenticate: jest.fn().mockResolvedValue(handleAuthenticateResponse),
      });

      const searchGuardBackend = setupSearchGuardBackendMock({
        getTenantByPreference: jest.fn().mockReturnValue(sgtenant),
      });

      const sessionStorageFactorySet = jest.fn();
      const sessionStorageFactory = setupSessionStorageFactoryMock({
        asScoped: jest.fn(() => ({
          set: sessionStorageFactorySet,
        })),
      });

      const request = {
        headers: {},
        body: { username: 'admin', password: 'admin' },
        url: {
          pathname: '/api/v1/auth/login',
          path: '/api/v1/auth/login',
          href: '/api/v1/auth/login',
        },
      };

      await loginAuthHandler({
        config,
        authInstance,
        logger,
        searchGuardBackend,
        sessionStorageFactory,
      })(context, request, response);

      expect(authInstance.handleAuthenticate).toHaveBeenCalledWith(request, { authHeaderValue });
      expect(searchGuardBackend.getTenantByPreference).toHaveBeenCalledWith(
        request,
        user.username,
        user.tenants,
        preferredTenants,
        globalTenantEnabled,
        privateTenantEnabled
      );
      expect(sessionStorageFactory.asScoped).toHaveBeenCalledWith(request);
      expect(sessionStorageFactorySet).toHaveBeenCalledWith({
        ...session,
        tenant: sgtenant,
      });
      expect(response.ok).toHaveBeenCalledWith({
        body: {
          username: user.username,
          tenants: user.tenants,
          roles: user.roles,
          backendroles: user.backendroles,
          selectedTenant: user.selectedTenant,
        },
      });
    });
  });

  describe('logoutHandler', () => {
    test('logout user', async () => {
      const context = setupContextMock();
      const response = setupHttpResponseMock();
      const authInstance = setupAuthInstanceMock();

      const request = {
        headers: {
          cookie: 'searchguard_authentication=Fe26.2**1fc15d70200b46f3a',
          authorization: 'Basic YWRtaW46YWRtaW4=',
          sgtenant: '__user__',
        },
        url: {
          pathname: '/api/v1/auth/logout',
          path: '/api/v1/auth/logout',
          href: '/api/v1/auth/logout',
        },
        auth: { isAuthenticated: true },
      };

      await logoutHandler({ authInstance })(context, request, response);

      expect(authInstance.clear).toHaveBeenCalledWith(request);
      expect(response.ok).toHaveBeenCalledTimes(1);
    });
  });
});
