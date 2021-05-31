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

import { sanitizeNextUrl } from '../../sanitize_next_url';
import MissingTenantError from '../../errors/missing_tenant_error';
import { customError as customErrorRoute } from '../common/routes';
import { schema } from '@kbn/config-schema';
import { APP_ROOT, API_ROOT } from '../../../../../utils/constants';

export const SAML_ROUTES = {
  LOGIN: `${APP_ROOT}/auth/saml/login`, // @todo Update this later - the auth selector page should probably do all the encoding
};

export function defineRoutes({
  authInstance,
  searchGuardBackend,
  kibanaCore,
  debugLog,
  sessionStorageFactory,
  logger,
}) {
  const basePath = kibanaCore.http.basePath.serverBasePath;
  const httpResources = kibanaCore.http.resources;
  const router = kibanaCore.http.createRouter();
  const httpAuth = kibanaCore.http.auth;

  const routesPath = '/auth/saml/';

  /**
   * The login page.
   */
  router.get(
    {
      path: `${APP_ROOT}${routesPath}login`,
      validate: false,
      options: {
        authRequired: false,
      },
    },
    async function (context, request, response) {
      try {
        /*
        When successful logout,
          headers: {
            cookie: 'searchguard_authentication='
          },
        */
        if (httpAuth.isAuthenticated(request)) {
          return response.redirected({
            headers: {
              location: `${basePath}/app/kibana`,
            },
          });
        }

        let nextUrl = null;
        if (request.url.searchParams.has('nextUrl')) {
          nextUrl = sanitizeNextUrl(request.url.searchParams.get('nextUrl'), basePath);
          // When logging in, nextUrl = /app/kibana
        }

        // Grab the request for SAML
        const samlHeader = await searchGuardBackend.getSamlHeader();
        /*
        When logging in,
        samlHeader = {
          location: 'http://keycloak.example.com:8080/auth/realms/master/protocol/saml?SAMLRequest=fVJdTyoxEP0rm74v3S2yYgMkKHov...',
          requestId: 'ONELOGIN_22c8c6a6-1a96-43aa-8ed9-2e5de6373cd7'
        }
        */

        const sessionCookie = (await sessionStorageFactory.asScoped(request).get()) || {};
        // When logging in, sessionCookie={}

        sessionCookie['temp-saml'] = {
          requestId: samlHeader.requestId,
          nextUrl,
        };

        await sessionStorageFactory.asScoped(request).set(sessionCookie);

        return response.redirected({ headers: { location: samlHeader.location } });
      } catch (error) {
        logger.error(`SAML auth, fail to obtain the SAML header: ${error.stack}`);
        return response.redirected({
          headers: { location: `${basePath}/customerror?type=samlConfigError` },
        });
      }
    }
  );

  /**
   * The page that the IdP redirects to after a successful SP-initiated login
   */
  router.post(
    {
      path: `${APP_ROOT}/searchguard/saml/acs`,
      options: {
        authRequired: false,
        xsrfRequired: false,
      },
      validate: {
        body: schema.object(
          {
            SAMLResponse: schema.string(),
          },
          { unknowns: 'allow' }
        ),
      },
    },
    async (context, request, response) => {
      try {
        const { body: { SAMLResponse } = {} } = request;
        /*
        When logging in,
        SAMLResponse = PHNhbWxwOlJlc3BvbnNlIHhtbG5zOnNhbWxwPSJ1cm46b2Fza...
        */

        const sessionCookie = await sessionStorageFactory.asScoped(request).get();
        if (!sessionCookie) {
          throw new Error('The session cookie is absent.');
        }
        /*
          When logging in,
          sessionCookie = {
            "temp-saml": {
              requestId: 'ONELOGIN_a0503578-1ae5-4621-80d5-49336f6d8673',
              nextUrl: '/app/kibana'
            }
          }
        */

        const { 'temp-saml': storedRequestInfo, ...restSessionCookie } = sessionCookie;
        await sessionStorageFactory.asScoped(request).set(restSessionCookie);

        if (!storedRequestInfo.requestId) {
          return response.redirected({
            headers: { location: `${basePath}/customerror?type=samlAuthError` },
          });
        }

        debugLog({ requestId: storedRequestInfo.requestId, SAMLResponse });

        const credentials = await searchGuardBackend.authtoken(
          storedRequestInfo.requestId || null,
          SAMLResponse
        );
        /*
        When logging in,
        credentials = {
          authorization: 'bearer eyJhbGciOiJIUzUxMiJ9.eyJuYmYiOjE2...'
        }
        */

        await authInstance.handleAuthenticate(request, {
          authHeaderValue: credentials.authorization,
        });

        const nextUrl = storedRequestInfo.nextUrl;
        // When logging in, nextUrl = /app/kibana

        if (nextUrl) {
          return response.redirected({
            headers: { location: sanitizeNextUrl(nextUrl, basePath) },
          });
        }

        return response.redirected({
          headers: { location: `${basePath}/app/kibana` },
        });
      } catch (error) {
        logger.error(`SAML auth, failed to authorize: ${error.stack}`);

        let errorType = 'samlAuthError';
        if (error instanceof MissingTenantError) {
          errorType = 'missingTenant';
        }

        return response.redirected({
          headers: { location: `${basePath}/customerror?type=${errorType}` },
        });
      }
    }
  );

  /**
   * The page that the IdP redirects to after a successful IdP-initiated login
   */
  router.post(
    {
      path: `${APP_ROOT}/searchguard/saml/acs/idpinitiated`,
      options: {
        authRequired: false,
        xsrfRequired: false,
      },
      validate: {
        body: schema.object(
          {
            SAMLResponse: schema.string(),
          },
          { unknowns: 'allow' }
        ),
      },
    },
    async (context, request, response) => {
      try {
        const acsEndpoint = `${APP_ROOT}/searchguard/saml/acs/idpinitiated`;
        const credentials = await searchGuardBackend.authtoken(
          null,
          request.body.SAMLResponse,
          acsEndpoint
        );

        await authInstance.handleAuthenticate(request, {
          authHeaderValue: credentials.authorization,
        });

        debugLog('Got SAMLResponse: ' + request.body.SAMLResponse);

        return response.redirected({
          headers: { location: `${basePath}/app/kibana` },
        });
      } catch (error) {
        logger.error(`SAML IDP initiated authorization failed: ${error.stack}`);

        let errorType = 'samlAuthError';
        if (error instanceof MissingTenantError) {
          errorType = 'missingTenant';
        }

        return response.redirected({
          headers: { location: `${basePath}/customerror?type=${errorType}` },
        });
      }
    }
  );

  /**
   * Redirect to logout page after an IdP redirect
   */
  const logoutPath = `${APP_ROOT}/searchguard/saml/logout`;
  const logoutOptions = {
    authRequired: false,
    xsrfRequired: false,
  };
  const logoutHandler = async (context, request, response) => {
    await authInstance.clear(request);
    // @todo Should customerror stay?
    return response.redirected({
      headers: { location: `${basePath}/customerror?type=samlLogoutSuccess` },
    });
  };
  // Logout route accepts both GET and POST
  router.get({ path: logoutPath, options: logoutOptions, validate: false }, logoutHandler);
  router.post({ path: logoutPath, options: logoutOptions, validate: false }, logoutHandler);

  /**
   * The custom error page.
   */
  //customErrorRoute({ httpResources });

  /**
   * Logout
   */
  router.post(
    {
      path: `${API_ROOT}/auth/logoutSAMLTEMP`,
      validate: false,
      options: {
        authRequired: false,
      },
    },
    async function (context, request, response) {
      try {
        const sessionCookie = await sessionStorageFactory.asScoped(request).get();
        if (!sessionCookie || !sessionCookie.credentials) {
          throw new Error('The session cookie or credentials is absent.');
        }
        /*
        When logging in,
        sessionCookie = {
          username: 'admin',
          credentials: {
            authHeaderValue: 'bearer eyJhbGciOiJIUzUxMiJ9.eyJuYmYiOjE2MDEw...'
          },
          authType: 'saml',
          exp: 1601046190,
          additionalAuthHeaders: null
        }
        */

        const authHeader = {
          [authInstance.authHeaderName]: sessionCookie.credentials.authHeaderValue,
        };

        const authInfo = await searchGuardBackend.authinfo(authHeader);
        /*
        When logging in,
        authInfo = {
          user: 'User [name=admin, backend_roles=[manage-account, ...], requestedTenant=null]',
          ...,
          sso_logout_url: 'http://keycloak.example.com:8080/auth/realms/master/protocol/saml?SAMLRequest=fVLRatwwEPwVo3edZdmKbXFnKF...'
        }
        */

        await authInstance.clear(request);

        if (authInfo && authInfo.sso_logout_url) {
          return response.ok({
            body: { redirectURL: authInfo.sso_logout_url },
          });
        }

        const redirectURL =
          authInfo && authInfo.sso_logout_url
            ? authInfo.sso_logout_url
            : `${APP_ROOT}/customerror?type=samlLogoutSuccess`;

        // The logout procedure:
        // 1. Logout from IDP.
        // 2. Logout from Kibana.
        return response.ok({ body: { redirectURL } });
      } catch (error) {
        logger.error(`SAML auth logout: ${error.stack}`);

        // The authenticated user is redirected back to Kibana home if his session is still active on IDP.
        // For some reason, response.redirected() doesn't pass query params to the customerror page here.
        return response.ok({
          body: {
            redirectURL: `${basePath}/customerror?type=samlAuthError`,
          },
        });
      }
    }
  );
} //end module
