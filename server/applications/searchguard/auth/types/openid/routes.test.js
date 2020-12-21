/*
 *    Copyright 2020 floragunn GmbH
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

import { cloneDeep } from 'lodash';
import { stringify } from 'querystring';
import AuthClass from './OpenId';
import { loginHandler, logoutHandler } from './routes';
import {
  setupConfigMock,
  setupLoggerMock,
  setupSessionStorageFactoryMock,
  setupHttpResponseMock,
  setupAuthInstanceMock,
  setupContextMock,
  setupKibanaCoreMock,
  setupDebugLogMock,
  setupSearchGuardBackendMock,
} from '../../../../../utils/mocks';

import { MissingTenantError, MissingRoleError } from '../../errors';

jest.mock('../../../../../../../../src/core/server/http/router', () => jest.fn());

jest.mock('cryptiles', () => ({
  randomString: jest.fn(() => 'ecF1onUEGkfbzBldXS6Unh'),
}));

describe(`${AuthClass.name} routes`, () => {
  describe('logoutHandler', () => {
    test('logout user', async () => {
      const context = setupContextMock();
      const response = setupHttpResponseMock();
      const logger = setupLoggerMock();
      const config = setupConfigMock();
      const basePath = '/abc';

      const getServerInfo = jest.fn().mockReturnValue({
        protocol: 'https',
        hostname: 'kibana.example.com',
        port: '5601',
      });
      const kibanaCore = setupKibanaCoreMock({ getServerInfo });

      const openIdEndPoints = {
        authorization_endpoint:
          'http://keycloak.example.com:8080/auth/realms/master/protocol/openid-connect/auth',
        token_endpoint:
          'http://keycloak.example.com:8080/auth/realms/master/protocol/openid-connect/token',
        end_session_endpoint:
          'http://keycloak.example.com:8080/auth/realms/master/protocol/openid-connect/logout',
      };

      const request = { a: 1 };

      const expectedSessionCookie = {
        username: 'admin',
        credentials: {
          authHeaderValue:
            'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJWLWRpcG9zZlVKSWs1akRCRmlfUVJvdWlWaW5HNVBvd3NrY1NXeTVFdUNvIn0.eyJqdGkiOiJiNGNjMDNhMS02N2UzLTRhZDQtODBlNS01MjZmZjAwZDBjZTIiLCJleHAiOjE2MDIzNDA3MDMsIm5iZiI6MCwiaWF0IjoxNjAyMzM3MTAzLCJpc3MiOiJodHRwOi8va2V5Y2xvYWsuZXhhbXBsZS5jb206ODA4MC9hdXRoL3JlYWxtcy9tYXN0ZXIiLCJhdWQiOiJlcy1vcGVuaWQiLCJzdWIiOiIyOTQzMGEwZi1hMDYwLTQ5MzAtYTFhNi0zYzNiYTQ2MmJmODIiLCJ0eXAiOiJJRCIsImF6cCI6ImVzLW9wZW5pZCIsImF1dGhfdGltZSI6MTYwMjMzNzEwMywic2Vzc2lvbl9zdGF0ZSI6Ijg1OTFlMjY0LTdjODktNDM0ZS1hOTljLTdjYjc1N2I4MDNiMSIsImFjciI6IjEiLCJyb2xlcyI6ImFkbWluLCBraWJhbmF1c2VyIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW4ifQ.EfU_PV5lVvY5Ctn2-1ffzjcTzCq2AU-mzNtCt0lZpLMCZJRlLaVH2atKUG11QPrsco5jqvz19HCQso6dVvrpAtq7erkW8pxWjKJelc4QKuA9zyq46oJ6mbruwZz3mhsjBCVl7JdWNJ9T0hkKLCqhpHwv5G2CcElOW54a0n_4HNvvfIMtbS9-uzPbU0zkP-HoZlRgQGQKN6ERsGNcNzvajL-aqursNT_bP7SgnBgqQccZyZzwXpanJIAuxi4rRV0AyqrbUoABWFw0M43d5OoJVkKYvfi-Ato1LzQKPWEHcPs6BlFQh4kX0DHmE9Z8oWsYRHl2Vq5wy7M8pPudp1-qdg',
        },
        authType: 'openid',
        exp: 1602340703,
        additionalAuthHeaders: null,
        tenant: '',
      };

      const sessionStorageFactoryGet = jest
        .fn()
        .mockResolvedValue(cloneDeep(expectedSessionCookie));
      const sessionStorageFactory = setupSessionStorageFactoryMock({
        asScoped: jest.fn(() => ({
          get: sessionStorageFactoryGet,
        })),
      });

      const authInstance = setupAuthInstanceMock();
      authInstance.sessionStorageFactory = sessionStorageFactory;

      await logoutHandler({
        kibanaCore,
        config,
        authInstance,
        basePath,
        openIdEndPoints,
        logger,
      })(context, cloneDeep(request), response);

      expect(authInstance.clear).toHaveBeenCalledWith(request);
      expect(response.ok).toHaveBeenCalledWith({
        body: {
          redirectURL:
            'http://keycloak.example.com:8080/auth/realms/master/protocol/openid-connect/logout?post_logout_redirect_uri=https://kibana.example.com:5601/abc/app/home&id_token_hint=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJWLWRpcG9zZlVKSWs1akRCRmlfUVJvdWlWaW5HNVBvd3NrY1NXeTVFdUNvIn0.eyJqdGkiOiJiNGNjMDNhMS02N2UzLTRhZDQtODBlNS01MjZmZjAwZDBjZTIiLCJleHAiOjE2MDIzNDA3MDMsIm5iZiI6MCwiaWF0IjoxNjAyMzM3MTAzLCJpc3MiOiJodHRwOi8va2V5Y2xvYWsuZXhhbXBsZS5jb206ODA4MC9hdXRoL3JlYWxtcy9tYXN0ZXIiLCJhdWQiOiJlcy1vcGVuaWQiLCJzdWIiOiIyOTQzMGEwZi1hMDYwLTQ5MzAtYTFhNi0zYzNiYTQ2MmJmODIiLCJ0eXAiOiJJRCIsImF6cCI6ImVzLW9wZW5pZCIsImF1dGhfdGltZSI6MTYwMjMzNzEwMywic2Vzc2lvbl9zdGF0ZSI6Ijg1OTFlMjY0LTdjODktNDM0ZS1hOTljLTdjYjc1N2I4MDNiMSIsImFjciI6IjEiLCJyb2xlcyI6ImFkbWluLCBraWJhbmF1c2VyIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW4ifQ.EfU_PV5lVvY5Ctn2-1ffzjcTzCq2AU-mzNtCt0lZpLMCZJRlLaVH2atKUG11QPrsco5jqvz19HCQso6dVvrpAtq7erkW8pxWjKJelc4QKuA9zyq46oJ6mbruwZz3mhsjBCVl7JdWNJ9T0hkKLCqhpHwv5G2CcElOW54a0n_4HNvvfIMtbS9-uzPbU0zkP-HoZlRgQGQKN6ERsGNcNzvajL-aqursNT_bP7SgnBgqQccZyZzwXpanJIAuxi4rRV0AyqrbUoABWFw0M43d5OoJVkKYvfi-Ato1LzQKPWEHcPs6BlFQh4kX0DHmE9Z8oWsYRHl2Vq5wy7M8pPudp1-qdg',
        },
      });
    });
  });

  describe('loginHandler', () => {
    test('unauthenticated user', async () => {
      const context = setupContextMock();
      const response = setupHttpResponseMock();
      const logger = setupLoggerMock();
      const config = setupConfigMock();
      const basePath = '/abc';
      const debugLog = setupDebugLogMock();

      const sessionStorageFactorySet = jest.fn();
      const sessionStorageFactoryGet = jest.fn().mockResolvedValue(null);
      const sessionStorageFactory = setupSessionStorageFactoryMock({
        asScoped: jest.fn(() => ({
          get: sessionStorageFactoryGet,
          set: sessionStorageFactorySet,
        })),
      });

      const authInstance = setupAuthInstanceMock();
      authInstance.sessionStorageFactory = sessionStorageFactory;

      const getServerInfo = jest.fn().mockReturnValue({
        hostname: 'kibana.example.com',
        port: '5601',
      });
      const kibanaCore = setupKibanaCoreMock({ getServerInfo });

      const routesPath = '/auth/openid/';
      const clientId = 'es-openid';
      const clientSecret = '50f0bdc8-7925-43bf-9186-91c40be5bf88';
      const scope = ['profile', 'email', 'openid'];
      const openIdEndPoints = {
        authorization_endpoint:
          'http://keycloak.example.com:8080/auth/realms/master/protocol/openid-connect/auth',
        token_endpoint:
          'http://keycloak.example.com:8080/auth/realms/master/protocol/openid-connect/token',
        end_session_endpoint:
          'http://keycloak.example.com:8080/auth/realms/master/protocol/openid-connect/logout',
      };

      const request = {
        headers: {},
        body: {},
        url: {
          pathname: '/auth/openid/login',
          href: '/auth/openid/login?nextUrl=%2Fapp%2Fkibana',
          query: { nextUrl: '/app/kibana' },
        },
      };

      const expectedSessionCookie = {
        openId: {
          nonce: 'ecF1onUEGkfbzBldXS6Unh',
          query: request.url.query,
        },
      };

      const expectedLocation =
        'http://keycloak.example.com:8080/auth/realms/master/protocol/openid-connect/auth?client_id=es-openid&response_type=code&redirect_uri=undefined%3A%2F%2Fkibana.example.com%3A5601%2Fabc%2Fauth%2Fopenid%2Flogin&state=ecF1onUEGkfbzBldXS6Unh&scope=profile%20email%20openid';

      await loginHandler({
        basePath,
        kibanaCore,
        config,
        routesPath,
        debugLog,
        authInstance,
        logger,
        clientId,
        clientSecret,
        scope,
        openIdEndPoints,
      })(context, cloneDeep(request), response);

      expect(getServerInfo).toHaveBeenCalledTimes(1);
      expect(sessionStorageFactory.asScoped).toHaveBeenCalledWith(request);
      expect(sessionStorageFactoryGet).toHaveBeenCalledTimes(1);
      expect(sessionStorageFactorySet).toHaveBeenCalledWith(expectedSessionCookie);
      expect(response.redirected).toHaveBeenCalledWith({
        headers: {
          location: expectedLocation,
        },
      });
    });

    test('user authenticated by IDP user', async () => {
      const context = setupContextMock();
      const response = setupHttpResponseMock();
      const logger = setupLoggerMock();
      const config = setupConfigMock();
      const basePath = '/abc';
      const debugLog = setupDebugLogMock();

      const expectedSessionCookie = {
        openId: { nonce: 'ecF1onUEGkfbzBldXS6Unh', query: { nextUrl: '/abc/app/kibana' } },
      };

      const sessionStorageFactorySet = jest.fn();
      const sessionStorageFactoryGet = jest
        .fn()
        .mockResolvedValue(cloneDeep(expectedSessionCookie));
      const sessionStorageFactory = setupSessionStorageFactoryMock({
        asScoped: jest.fn(() => ({
          get: sessionStorageFactoryGet,
          set: sessionStorageFactorySet,
        })),
      });

      const routesPath = '/auth/openid/';
      const clientId = 'es-openid';
      const clientSecret = '50f0bdc8-7925-43bf-9186-91c40be5bf88';
      const scope = ['profile', 'email', 'openid'];
      const redirectUri = 'https://kibana.example.com:5601/abc/auth/openid/login';

      const openIdEndPoints = {
        authorization_endpoint:
          'http://keycloak.example.com:8080/auth/realms/master/protocol/openid-connect/auth',
        token_endpoint:
          'http://keycloak.example.com:8080/auth/realms/master/protocol/openid-connect/token',
        end_session_endpoint:
          'http://keycloak.example.com:8080/auth/realms/master/protocol/openid-connect/logout',
      };

      const request = {
        params: {},
        query: {},
        body: {},
        url: {
          search:
            '?state=ecF1onUEGkfbzBldXS6Unh&session_state=05d65b77-d4bf-4661-a8af-9d065945b6f3&code=eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..ylG_YpO714QbfeN1sV1p-A.5HA8shWEmh1oyJv-8kDLea5UXIWGkre2pZ9g_TODgAct6TyHth757FVM72jt4r_vBZv7bkjBMMXe59xrbq4rXVyxAV6tKnro8de60n0iHriadzcjVmJXwaGQMA2Ld_r7sKKQKibrjf2Danx-eYbgFQ5Z9PCIq5a4xxdo0pQ3Ymf1dxBX9ZuG4R7qTLhZyqGyyFDMMLw0RpqGqPgemsTDFdLk3WNrPfE1iEAS-Bvv-VOHZJ-LsH_NuXPpjI3KPPCJ.6bOOPX38Xqfqs-DmOMExFw',
          query: {
            state: 'ecF1onUEGkfbzBldXS6Unh',
            session_state: '05d65b77-d4bf-4661-a8af-9d065945b6f3',
            code:
              'eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..ylG_YpO714QbfeN1sV1p-A.5HA8shWEmh1oyJv-8kDLea5UXIWGkre2pZ9g_TODgAct6TyHth757FVM72jt4r_vBZv7bkjBMMXe59xrbq4rXVyxAV6tKnro8de60n0iHriadzcjVmJXwaGQMA2Ld_r7sKKQKibrjf2Danx-eYbgFQ5Z9PCIq5a4xxdo0pQ3Ymf1dxBX9ZuG4R7qTLhZyqGyyFDMMLw0RpqGqPgemsTDFdLk3WNrPfE1iEAS-Bvv-VOHZJ-LsH_NuXPpjI3KPPCJ.6bOOPX38Xqfqs-DmOMExFw',
          },
          pathname: '/auth/openid/login',
          href:
            '/auth/openid/login?state=ecF1onUEGkfbzBldXS6Unh&session_state=05d65b77-d4bf-4661-a8af-9d065945b6f3&code=eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..ylG_YpO714QbfeN1sV1p-A.5HA8shWEmh1oyJv-8kDLea5UXIWGkre2pZ9g_TODgAct6TyHth757FVM72jt4r_vBZv7bkjBMMXe59xrbq4rXVyxAV6tKnro8de60n0iHriadzcjVmJXwaGQMA2Ld_r7sKKQKibrjf2Danx-eYbgFQ5Z9PCIq5a4xxdo0pQ3Ymf1dxBX9ZuG4R7qTLhZyqGyyFDMMLw0RpqGqPgemsTDFdLk3WNrPfE1iEAS-Bvv-VOHZJ-LsH_NuXPpjI3KPPCJ.6bOOPX38Xqfqs-DmOMExFw',
        },
      };

      const expectedLocation = '/abc/app/kibana';

      const bodyForTokenRequest = stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: request.url.query.code,
        redirect_uri: redirectUri,
      });

      const idpPayload = {
        access_token:
          'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJWLWRpcG9zZlVKSWs1akRCRmlfUVJvdWlWaW5HNVBvd3NrY1NXeTVFdUNvIn0.eyJqdGkiOiI0OWQ4ZDgwNS1kYTllLTQ3ZmItODQxNC0yZTFiYWFlNmIzYTciLCJleHAiOjE2MDIzMzEwNjYsIm5iZiI6MCwiaWF0IjoxNjAyMzI3NDY2LCJpc3MiOiJodHRwOi8va2V5Y2xvYWsuZXhhbXBsZS5jb206ODA4MC9hdXRoL3JlYWxtcy9tYXN0ZXIiLCJhdWQiOiJlcy1vcGVuaWQiLCJzdWIiOiIyOTQzMGEwZi1hMDYwLTQ5MzAtYTFhNi0zYzNiYTQ2MmJmODIiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJlcy1vcGVuaWQiLCJhdXRoX3RpbWUiOjE2MDIzMjc0NjYsInNlc3Npb25fc3RhdGUiOiIwNWQ2NWI3Ny1kNGJmLTQ2NjEtYThhZi05ZDA2NTk0NWI2ZjMiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImNyZWF0ZS1yZWFsbSIsImFkbWluIiwidW1hX2F1dGhvcml6YXRpb24iLCJraWJhbmF1c2VyIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsibWFzdGVyLXJlYWxtIjp7InJvbGVzIjpbInZpZXctaWRlbnRpdHktcHJvdmlkZXJzIiwidmlldy1yZWFsbSIsIm1hbmFnZS1pZGVudGl0eS1wcm92aWRlcnMiLCJpbXBlcnNvbmF0aW9uIiwiY3JlYXRlLWNsaWVudCIsIm1hbmFnZS11c2VycyIsInF1ZXJ5LXJlYWxtcyIsInZpZXctYXV0aG9yaXphdGlvbiIsInF1ZXJ5LWNsaWVudHMiLCJxdWVyeS11c2VycyIsIm1hbmFnZS1ldmVudHMiLCJtYW5hZ2UtcmVhbG0iLCJ2aWV3LWV2ZW50cyIsInZpZXctdXNlcnMiLCJ2aWV3LWNsaWVudHMiLCJtYW5hZ2UtYXV0aG9yaXphdGlvbiIsIm1hbmFnZS1jbGllbnRzIiwicXVlcnktZ3JvdXBzIl19LCJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJyb2xlcyI6ImFkbWluLCBraWJhbmF1c2VyIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW4ifQ.lrXmv_SNt1jRPbyiEGIHJoKKYkZcbtK8Ld_ZNyvBB_FDx5I_jqV_HHuFeKwArNiCPxFU_OlZ97lxssf7NGBydgR_rUxLQmp-2YJ_zrrq7sBJKLJU4rPmnf7JJXBIXzZ8EcJTDP9Is0bZJG9g8lvJSYDsmUu95DFdMzxX3jwNjGOA4jB_owqeXHdHHowPcnB9MWHzCMR8x9-zKyHSuGSArTukqOR_tFo0GvWy-vb3WtMpzfvWIhCvSOHVMvcN9bW_7u6zb9XLbymvsupfNUAlHMH0cysKdkUSH9gyKhJZ3ErAwq8rLJjgdevpeeSSR83oCNCnxuj7XBYN0KqYG2DQVQ',
        expires_in: 3600,
        refresh_expires_in: 1800,
        refresh_token:
          'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJWLWRpcG9zZlVKSWs1akRCRmlfUVJvdWlWaW5HNVBvd3NrY1NXeTVFdUNvIn0.eyJqdGkiOiI5MzM3YTU5Zi1lODc3LTQ0OTMtYTBmYS03NTRjZWYzODdjM2IiLCJleHAiOjE2MDIzMjkyNjYsIm5iZiI6MCwiaWF0IjoxNjAyMzI3NDY2LCJpc3MiOiJodHRwOi8va2V5Y2xvYWsuZXhhbXBsZS5jb206ODA4MC9hdXRoL3JlYWxtcy9tYXN0ZXIiLCJhdWQiOiJlcy1vcGVuaWQiLCJzdWIiOiIyOTQzMGEwZi1hMDYwLTQ5MzAtYTFhNi0zYzNiYTQ2MmJmODIiLCJ0eXAiOiJSZWZyZXNoIiwiYXpwIjoiZXMtb3BlbmlkIiwiYXV0aF90aW1lIjowLCJzZXNzaW9uX3N0YXRlIjoiMDVkNjViNzctZDRiZi00NjYxLWE4YWYtOWQwNjU5NDViNmYzIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImNyZWF0ZS1yZWFsbSIsImFkbWluIiwidW1hX2F1dGhvcml6YXRpb24iLCJraWJhbmF1c2VyIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsibWFzdGVyLXJlYWxtIjp7InJvbGVzIjpbInZpZXctaWRlbnRpdHktcHJvdmlkZXJzIiwidmlldy1yZWFsbSIsIm1hbmFnZS1pZGVudGl0eS1wcm92aWRlcnMiLCJpbXBlcnNvbmF0aW9uIiwiY3JlYXRlLWNsaWVudCIsIm1hbmFnZS11c2VycyIsInF1ZXJ5LXJlYWxtcyIsInZpZXctYXV0aG9yaXphdGlvbiIsInF1ZXJ5LWNsaWVudHMiLCJxdWVyeS11c2VycyIsIm1hbmFnZS1ldmVudHMiLCJtYW5hZ2UtcmVhbG0iLCJ2aWV3LWV2ZW50cyIsInZpZXctdXNlcnMiLCJ2aWV3LWNsaWVudHMiLCJtYW5hZ2UtYXV0aG9yaXphdGlvbiIsIm1hbmFnZS1jbGllbnRzIiwicXVlcnktZ3JvdXBzIl19LCJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19fQ.p5WGs-fxWByJ7vKcWYfnJMpPZg3aOgt5echXKw56FckcelhKkCD_WwdwRkunOF1BVtcDHJmKwO2vdN51-Yk3aawvS1sW31vYfH5nYXJ8WG1wlkb4FZh7-iD_VpA3TFY_w1qFWMoe_NzcEzZ7R5lpjOtZpbbuqESN7YY_fc-fDNtu40BjlZkEFWGVZSiSWVsGfUqhgpKBaU38E2QKu_63H86SNHxWieZsxkR8mwZSDul3tgVlt90ZQBGdNNw7gD0JSHVQHEUNpSTadfqzCgg1Npp8HSfxmxuZbjn85UA0ZrkUOZI5LvduEPwLT1UXW5k4pVNPZizF7fl1Gi-VLKXoqA',
        token_type: 'bearer',
        id_token:
          'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJWLWRpcG9zZlVKSWs1akRCRmlfUVJvdWlWaW5HNVBvd3NrY1NXeTVFdUNvIn0.eyJqdGkiOiI0Y2QzZTg0Yi02NmM5LTQzMjMtYjA5NC1hYWQ2OTBlYmJiM2EiLCJleHAiOjE2MDIzMzEwNjYsIm5iZiI6MCwiaWF0IjoxNjAyMzI3NDY2LCJpc3MiOiJodHRwOi8va2V5Y2xvYWsuZXhhbXBsZS5jb206ODA4MC9hdXRoL3JlYWxtcy9tYXN0ZXIiLCJhdWQiOiJlcy1vcGVuaWQiLCJzdWIiOiIyOTQzMGEwZi1hMDYwLTQ5MzAtYTFhNi0zYzNiYTQ2MmJmODIiLCJ0eXAiOiJJRCIsImF6cCI6ImVzLW9wZW5pZCIsImF1dGhfdGltZSI6MTYwMjMyNzQ2Niwic2Vzc2lvbl9zdGF0ZSI6IjA1ZDY1Yjc3LWQ0YmYtNDY2MS1hOGFmLTlkMDY1OTQ1YjZmMyIsImFjciI6IjEiLCJyb2xlcyI6ImFkbWluLCBraWJhbmF1c2VyIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW4ifQ.jM1Pk_pnc0P76zPo6lN_RG0agjLZYxfuPUrSvraUJeP2Rzv83Q81qsoP9hBXZ8rJLBq6-h9HSSgWh5Sds9KHqrCfcanWiW1a-LrNWXPbbMWiaolMTE8rQBd2nur4DEuyupfRikJcYMTBLj62H4J1fWNgXoV-RIsUL2i0xpqhf4iyzxZ_FTuM3mGIn-6X6skkursGYuU2wrF9i0B-QpB8vmWwGm4-Vvpov74Fcl3pxA3Kp_6X2LSyEmHqQlfSDEkaLIOLszudyldZrLwirz3f8nT-4jtG565uYotpcs8KBoZ8ljHvU9noj4px1VihZST9-9u71LIAkh24C2WzfynE5g',
        'not-before-policy': 0,
        session_state: '05d65b77-d4bf-4661-a8af-9d065945b6f3',
        scope: '',
      };

      const authInstance = setupAuthInstanceMock();
      authInstance.sessionStorageFactory = sessionStorageFactory;

      const getServerInfo = jest.fn().mockReturnValue({
        protocol: 'https',
        hostname: 'kibana.example.com',
        port: '5601',
      });
      const kibanaCore = setupKibanaCoreMock({ getServerInfo });

      const searchGuardBackend = setupSearchGuardBackendMock({
        getOIDCToken: jest.fn().mockReturnValue(idpPayload),
      });

      await loginHandler({
        basePath,
        kibanaCore,
        config,
        routesPath,
        debugLog,
        authInstance,
        logger,
        clientId,
        clientSecret,
        scope,
        openIdEndPoints,
        searchGuardBackend,
      })(context, cloneDeep(request), response);

      expect(getServerInfo).toHaveBeenCalledTimes(1);
      expect(sessionStorageFactory.asScoped).toHaveBeenCalledWith(request);
      expect(sessionStorageFactoryGet).toHaveBeenCalledTimes(1);

      const clearSessionCookie = { ...expectedSessionCookie };
      delete clearSessionCookie.openId;
      expect(sessionStorageFactorySet).toHaveBeenCalledWith(clearSessionCookie);

      expect(searchGuardBackend.getOIDCToken).toHaveBeenCalledWith({
        tokenEndpoint: openIdEndPoints.token_endpoint,
        body: bodyForTokenRequest,
      });

      expect(authInstance.handleAuthenticate).toHaveBeenCalledWith(request, {
        authHeaderValue: `Bearer ${idpPayload.id_token}`,
      });
      expect(response.redirected).toHaveBeenCalledWith({
        headers: {
          location: expectedLocation,
        },
      });
    });

    describe('throw error', () => {
      let response;
      let context;
      let logger;
      let config;
      let basePath;
      let debugLog;
      let expectedSessionCookie;
      let sessionStorageFactorySet;
      let sessionStorageFactoryGet;
      let sessionStorageFactory;
      let routesPath;
      let clientId;
      let clientSecret;
      let scope;
      let openIdEndPoints;
      let request;
      let idpPayload;
      let getServerInfo;
      let kibanaCore;
      let searchGuardBackend;

      beforeEach(() => {
        response = setupHttpResponseMock();
        context = setupContextMock();
        logger = setupLoggerMock();
        config = setupConfigMock();
        basePath = '/abc';
        debugLog = setupDebugLogMock();

        expectedSessionCookie = {
          openId: { nonce: 'ecF1onUEGkfbzBldXS6Unh', query: { nextUrl: '/abc/app/kibana' } },
        };

        sessionStorageFactorySet = jest.fn();
        sessionStorageFactoryGet = jest.fn().mockResolvedValue(cloneDeep(expectedSessionCookie));
        sessionStorageFactory = setupSessionStorageFactoryMock({
          asScoped: jest.fn(() => ({
            get: sessionStorageFactoryGet,
            set: sessionStorageFactorySet,
          })),
        });

        routesPath = '/auth/openid/';
        clientId = 'es-openid';
        clientSecret = '50f0bdc8-7925-43bf-9186-91c40be5bf88';
        scope = ['profile', 'email', 'openid'];
        openIdEndPoints = {
          authorization_endpoint:
            'http://keycloak.example.com:8080/auth/realms/master/protocol/openid-connect/auth',
          token_endpoint:
            'http://keycloak.example.com:8080/auth/realms/master/protocol/openid-connect/token',
          end_session_endpoint:
            'http://keycloak.example.com:8080/auth/realms/master/protocol/openid-connect/logout',
        };

        request = {
          params: {},
          query: {},
          body: {},
          url: {
            search:
              '?state=ecF1onUEGkfbzBldXS6Unh&session_state=05d65b77-d4bf-4661-a8af-9d065945b6f3&code=eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..ylG_YpO714QbfeN1sV1p-A.5HA8shWEmh1oyJv-8kDLea5UXIWGkre2pZ9g_TODgAct6TyHth757FVM72jt4r_vBZv7bkjBMMXe59xrbq4rXVyxAV6tKnro8de60n0iHriadzcjVmJXwaGQMA2Ld_r7sKKQKibrjf2Danx-eYbgFQ5Z9PCIq5a4xxdo0pQ3Ymf1dxBX9ZuG4R7qTLhZyqGyyFDMMLw0RpqGqPgemsTDFdLk3WNrPfE1iEAS-Bvv-VOHZJ-LsH_NuXPpjI3KPPCJ.6bOOPX38Xqfqs-DmOMExFw',
            query: {
              state: 'ecF1onUEGkfbzBldXS6Unh',
              session_state: '05d65b77-d4bf-4661-a8af-9d065945b6f3',
              code:
                'eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..ylG_YpO714QbfeN1sV1p-A.5HA8shWEmh1oyJv-8kDLea5UXIWGkre2pZ9g_TODgAct6TyHth757FVM72jt4r_vBZv7bkjBMMXe59xrbq4rXVyxAV6tKnro8de60n0iHriadzcjVmJXwaGQMA2Ld_r7sKKQKibrjf2Danx-eYbgFQ5Z9PCIq5a4xxdo0pQ3Ymf1dxBX9ZuG4R7qTLhZyqGyyFDMMLw0RpqGqPgemsTDFdLk3WNrPfE1iEAS-Bvv-VOHZJ-LsH_NuXPpjI3KPPCJ.6bOOPX38Xqfqs-DmOMExFw',
            },
            pathname: '/auth/openid/login',
            href:
              '/auth/openid/login?state=ecF1onUEGkfbzBldXS6Unh&session_state=05d65b77-d4bf-4661-a8af-9d065945b6f3&code=eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..ylG_YpO714QbfeN1sV1p-A.5HA8shWEmh1oyJv-8kDLea5UXIWGkre2pZ9g_TODgAct6TyHth757FVM72jt4r_vBZv7bkjBMMXe59xrbq4rXVyxAV6tKnro8de60n0iHriadzcjVmJXwaGQMA2Ld_r7sKKQKibrjf2Danx-eYbgFQ5Z9PCIq5a4xxdo0pQ3Ymf1dxBX9ZuG4R7qTLhZyqGyyFDMMLw0RpqGqPgemsTDFdLk3WNrPfE1iEAS-Bvv-VOHZJ-LsH_NuXPpjI3KPPCJ.6bOOPX38Xqfqs-DmOMExFw',
          },
        };

        idpPayload = {
          access_token:
            'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJWLWRpcG9zZlVKSWs1akRCRmlfUVJvdWlWaW5HNVBvd3NrY1NXeTVFdUNvIn0.eyJqdGkiOiI0OWQ4ZDgwNS1kYTllLTQ3ZmItODQxNC0yZTFiYWFlNmIzYTciLCJleHAiOjE2MDIzMzEwNjYsIm5iZiI6MCwiaWF0IjoxNjAyMzI3NDY2LCJpc3MiOiJodHRwOi8va2V5Y2xvYWsuZXhhbXBsZS5jb206ODA4MC9hdXRoL3JlYWxtcy9tYXN0ZXIiLCJhdWQiOiJlcy1vcGVuaWQiLCJzdWIiOiIyOTQzMGEwZi1hMDYwLTQ5MzAtYTFhNi0zYzNiYTQ2MmJmODIiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJlcy1vcGVuaWQiLCJhdXRoX3RpbWUiOjE2MDIzMjc0NjYsInNlc3Npb25fc3RhdGUiOiIwNWQ2NWI3Ny1kNGJmLTQ2NjEtYThhZi05ZDA2NTk0NWI2ZjMiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImNyZWF0ZS1yZWFsbSIsImFkbWluIiwidW1hX2F1dGhvcml6YXRpb24iLCJraWJhbmF1c2VyIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsibWFzdGVyLXJlYWxtIjp7InJvbGVzIjpbInZpZXctaWRlbnRpdHktcHJvdmlkZXJzIiwidmlldy1yZWFsbSIsIm1hbmFnZS1pZGVudGl0eS1wcm92aWRlcnMiLCJpbXBlcnNvbmF0aW9uIiwiY3JlYXRlLWNsaWVudCIsIm1hbmFnZS11c2VycyIsInF1ZXJ5LXJlYWxtcyIsInZpZXctYXV0aG9yaXphdGlvbiIsInF1ZXJ5LWNsaWVudHMiLCJxdWVyeS11c2VycyIsIm1hbmFnZS1ldmVudHMiLCJtYW5hZ2UtcmVhbG0iLCJ2aWV3LWV2ZW50cyIsInZpZXctdXNlcnMiLCJ2aWV3LWNsaWVudHMiLCJtYW5hZ2UtYXV0aG9yaXphdGlvbiIsIm1hbmFnZS1jbGllbnRzIiwicXVlcnktZ3JvdXBzIl19LCJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJyb2xlcyI6ImFkbWluLCBraWJhbmF1c2VyIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW4ifQ.lrXmv_SNt1jRPbyiEGIHJoKKYkZcbtK8Ld_ZNyvBB_FDx5I_jqV_HHuFeKwArNiCPxFU_OlZ97lxssf7NGBydgR_rUxLQmp-2YJ_zrrq7sBJKLJU4rPmnf7JJXBIXzZ8EcJTDP9Is0bZJG9g8lvJSYDsmUu95DFdMzxX3jwNjGOA4jB_owqeXHdHHowPcnB9MWHzCMR8x9-zKyHSuGSArTukqOR_tFo0GvWy-vb3WtMpzfvWIhCvSOHVMvcN9bW_7u6zb9XLbymvsupfNUAlHMH0cysKdkUSH9gyKhJZ3ErAwq8rLJjgdevpeeSSR83oCNCnxuj7XBYN0KqYG2DQVQ',
          expires_in: 3600,
          refresh_expires_in: 1800,
          refresh_token:
            'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJWLWRpcG9zZlVKSWs1akRCRmlfUVJvdWlWaW5HNVBvd3NrY1NXeTVFdUNvIn0.eyJqdGkiOiI5MzM3YTU5Zi1lODc3LTQ0OTMtYTBmYS03NTRjZWYzODdjM2IiLCJleHAiOjE2MDIzMjkyNjYsIm5iZiI6MCwiaWF0IjoxNjAyMzI3NDY2LCJpc3MiOiJodHRwOi8va2V5Y2xvYWsuZXhhbXBsZS5jb206ODA4MC9hdXRoL3JlYWxtcy9tYXN0ZXIiLCJhdWQiOiJlcy1vcGVuaWQiLCJzdWIiOiIyOTQzMGEwZi1hMDYwLTQ5MzAtYTFhNi0zYzNiYTQ2MmJmODIiLCJ0eXAiOiJSZWZyZXNoIiwiYXpwIjoiZXMtb3BlbmlkIiwiYXV0aF90aW1lIjowLCJzZXNzaW9uX3N0YXRlIjoiMDVkNjViNzctZDRiZi00NjYxLWE4YWYtOWQwNjU5NDViNmYzIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImNyZWF0ZS1yZWFsbSIsImFkbWluIiwidW1hX2F1dGhvcml6YXRpb24iLCJraWJhbmF1c2VyIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsibWFzdGVyLXJlYWxtIjp7InJvbGVzIjpbInZpZXctaWRlbnRpdHktcHJvdmlkZXJzIiwidmlldy1yZWFsbSIsIm1hbmFnZS1pZGVudGl0eS1wcm92aWRlcnMiLCJpbXBlcnNvbmF0aW9uIiwiY3JlYXRlLWNsaWVudCIsIm1hbmFnZS11c2VycyIsInF1ZXJ5LXJlYWxtcyIsInZpZXctYXV0aG9yaXphdGlvbiIsInF1ZXJ5LWNsaWVudHMiLCJxdWVyeS11c2VycyIsIm1hbmFnZS1ldmVudHMiLCJtYW5hZ2UtcmVhbG0iLCJ2aWV3LWV2ZW50cyIsInZpZXctdXNlcnMiLCJ2aWV3LWNsaWVudHMiLCJtYW5hZ2UtYXV0aG9yaXphdGlvbiIsIm1hbmFnZS1jbGllbnRzIiwicXVlcnktZ3JvdXBzIl19LCJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19fQ.p5WGs-fxWByJ7vKcWYfnJMpPZg3aOgt5echXKw56FckcelhKkCD_WwdwRkunOF1BVtcDHJmKwO2vdN51-Yk3aawvS1sW31vYfH5nYXJ8WG1wlkb4FZh7-iD_VpA3TFY_w1qFWMoe_NzcEzZ7R5lpjOtZpbbuqESN7YY_fc-fDNtu40BjlZkEFWGVZSiSWVsGfUqhgpKBaU38E2QKu_63H86SNHxWieZsxkR8mwZSDul3tgVlt90ZQBGdNNw7gD0JSHVQHEUNpSTadfqzCgg1Npp8HSfxmxuZbjn85UA0ZrkUOZI5LvduEPwLT1UXW5k4pVNPZizF7fl1Gi-VLKXoqA',
          token_type: 'bearer',
          id_token:
            'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJWLWRpcG9zZlVKSWs1akRCRmlfUVJvdWlWaW5HNVBvd3NrY1NXeTVFdUNvIn0.eyJqdGkiOiI0Y2QzZTg0Yi02NmM5LTQzMjMtYjA5NC1hYWQ2OTBlYmJiM2EiLCJleHAiOjE2MDIzMzEwNjYsIm5iZiI6MCwiaWF0IjoxNjAyMzI3NDY2LCJpc3MiOiJodHRwOi8va2V5Y2xvYWsuZXhhbXBsZS5jb206ODA4MC9hdXRoL3JlYWxtcy9tYXN0ZXIiLCJhdWQiOiJlcy1vcGVuaWQiLCJzdWIiOiIyOTQzMGEwZi1hMDYwLTQ5MzAtYTFhNi0zYzNiYTQ2MmJmODIiLCJ0eXAiOiJJRCIsImF6cCI6ImVzLW9wZW5pZCIsImF1dGhfdGltZSI6MTYwMjMyNzQ2Niwic2Vzc2lvbl9zdGF0ZSI6IjA1ZDY1Yjc3LWQ0YmYtNDY2MS1hOGFmLTlkMDY1OTQ1YjZmMyIsImFjciI6IjEiLCJyb2xlcyI6ImFkbWluLCBraWJhbmF1c2VyIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW4ifQ.jM1Pk_pnc0P76zPo6lN_RG0agjLZYxfuPUrSvraUJeP2Rzv83Q81qsoP9hBXZ8rJLBq6-h9HSSgWh5Sds9KHqrCfcanWiW1a-LrNWXPbbMWiaolMTE8rQBd2nur4DEuyupfRikJcYMTBLj62H4J1fWNgXoV-RIsUL2i0xpqhf4iyzxZ_FTuM3mGIn-6X6skkursGYuU2wrF9i0B-QpB8vmWwGm4-Vvpov74Fcl3pxA3Kp_6X2LSyEmHqQlfSDEkaLIOLszudyldZrLwirz3f8nT-4jtG565uYotpcs8KBoZ8ljHvU9noj4px1VihZST9-9u71LIAkh24C2WzfynE5g',
          'not-before-policy': 0,
          session_state: '05d65b77-d4bf-4661-a8af-9d065945b6f3',
          scope: '',
        };

        searchGuardBackend = setupSearchGuardBackendMock({
          getOIDCToken: jest.fn().mockReturnValue(idpPayload),
        });

        getServerInfo = jest.fn().mockReturnValue({
          protocol: 'https',
          hostname: 'kibana.example.com',
          port: '5601',
        });
        kibanaCore = setupKibanaCoreMock({ getServerInfo });
      });

      test('missing tenant', async () => {
        const error = new MissingTenantError('nasty!');
        const expectedLocation = '/abc/customerror?type=missingTenant';

        const handleAuthenticate = jest.fn().mockRejectedValue(error);
        const authInstance = setupAuthInstanceMock({ handleAuthenticate });
        authInstance.sessionStorageFactory = sessionStorageFactory;

        await loginHandler({
          basePath,
          kibanaCore,
          config,
          routesPath,
          debugLog,
          authInstance,
          logger,
          clientId,
          clientSecret,
          scope,
          openIdEndPoints,
          searchGuardBackend,
        })(context, request, response);

        expect(response.redirected).toHaveBeenCalledWith({
          headers: {
            location: expectedLocation,
          },
        });
      });

      test('missing role', async () => {
        const error = new MissingRoleError('nasty!');
        const expectedLocation = '/abc/customerror?type=missingRole';

        const handleAuthenticate = jest.fn().mockRejectedValue(error);
        const authInstance = setupAuthInstanceMock({ handleAuthenticate });
        authInstance.sessionStorageFactory = sessionStorageFactory;

        await loginHandler({
          basePath,
          kibanaCore,
          config,
          routesPath,
          debugLog,
          authInstance,
          logger,
          clientId,
          clientSecret,
          scope,
          openIdEndPoints,
          searchGuardBackend,
        })(context, cloneDeep(request), response);

        expect(response.redirected).toHaveBeenCalledWith({
          headers: {
            location: expectedLocation,
          },
        });
      });

      test('auth error', async () => {
        const error = new Error('nasty!');
        const expectedLocation = '/abc/customerror?type=authError';

        const handleAuthenticate = jest.fn().mockRejectedValue(error);
        const authInstance = setupAuthInstanceMock({ handleAuthenticate });
        authInstance.sessionStorageFactory = sessionStorageFactory;

        await loginHandler({
          basePath,
          kibanaCore,
          config,
          routesPath,
          debugLog,
          authInstance,
          logger,
          clientId,
          clientSecret,
          scope,
          openIdEndPoints,
        })(context, cloneDeep(request), response);

        expect(response.redirected).toHaveBeenCalledWith({
          headers: {
            location: expectedLocation,
          },
        });
      });
    });
  });
});
