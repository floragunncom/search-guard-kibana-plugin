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
import { ensureRawRequest } from '../../../../../../src/core/server/http/router/request';
import { schema } from '@kbn/config-schema';

module.exports = function (
  authInstance,
  searchGuardBackend,
  server,
  APP_ROOT,
  API_ROOT,
  kibanaCore,
  kibanaConfig,
  debugLog
) {
  const config = kibanaConfig;
  const basePath = kibanaCore.http.basePath.serverBasePath;
  const httpResources = kibanaCore.http.resources;
  const router = kibanaCore.http.createRouter();

  const routesPath = '/auth/saml/';

  /**
   * The login page.
   */
  server.route({
    method: 'GET',
    path: `${APP_ROOT}${routesPath}login`,
    options: {
      auth: false,
    },
    async handler(request, h) {
      if (request.auth.isAuthenticated) {
        return h.redirect(basePath + '/app/kibana');
      }

      let nextUrl = null;
      if (request.url && request.url.query && request.url.query.nextUrl) {
        nextUrl = sanitizeNextUrl(request.url.query.nextUrl, basePath);
      }

      // Grab the request for SAML
      try {
        const samlHeader = await searchGuardBackend.getSamlHeader();
        // @todo This would need to be handled in the auth cookie now
        request.auth.sgSessionStorage.putStorage('temp-saml', {
          requestId: samlHeader.requestId,
          nextUrl: nextUrl,
        });

        return h.redirect(samlHeader.location).takeover();
      } catch (error) {
        server.log(
          ['searchguard', 'error'],
          `An error occurred while obtaining the SAML header ${error}`
        );
        return h.redirect(basePath + '/customerror?type=samlConfigError');
      }
    },
  });

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
      const rawRequest = ensureRawRequest(request);
      // @todo This would need to be handled in the auth cookie now
      const storedRequestInfo = rawRequest.auth.sgSessionStorage.getStorage('temp-saml', {});
      rawRequest.auth.sgSessionStorage.clearStorage('temp-saml');

      if (!storedRequestInfo.requestId) {
        return response.redirected({
          headers: { location: `${basePath}/customerror?type=samlAuthError` },
        });
      }

      try {
        debugLog({
          requestId: storedRequestInfo.requestId,
          SAMLResponse: request.body.SAMLResponse,
        });

        const credentials = await searchGuardBackend.authtoken(
          storedRequestInfo.requestId || null,
          request.body.SAMLResponse
        );

        await authInstance.handleAuthenticate(request, {
          authHeaderValue: credentials.authorization,
        });

        let nextUrl = storedRequestInfo.nextUrl;

        if (nextUrl) {
          nextUrl = sanitizeNextUrl(nextUrl, basePath);
          return response.redirected({
            headers: { location: `${nextUrl}` },
          });
        }

        return response.redirected({
          headers: { location: `${basePath}/app/kibana` },
        });
      } catch (error) {
        console.error(['searchguard', 'error'], `SAML ACS ${error}`);

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
        console.error(['searchguard', 'error'], `SAML ACS IDP initiated ${error}`);

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
  const logoutHandler = (context, request, response) => {
    authInstance.clear(request);
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
  customErrorRoute({ httpResources });

  /**
   * Logout
   */
  server.route({
    method: 'POST',
    path: `${API_ROOT}/auth/logout`,
    handler: async (request) => {
      const cookieName = config.get('searchguard.cookie.name');
      let authInfo = null;

      try {
        // @todo Removed sessionPlugin, but route and cookie handling needs to be migrated still
        const authHeader = {
          [authInstance.authHeaderName]: request.state[cookieName].credentials.authHeaderValue,
        };
        authInfo = await searchGuardBackend.authinfo(authHeader);
      } catch (error) {
        server.log(['searchguard', 'error'], `SAML auth logout ${error}`);
        // Not much we can do here, so we'll just fall back to the login page if we don't get an sso_logout_url
      }

      authInstance.clear(request);
      const redirectURL =
        authInfo && authInfo.sso_logout_url
          ? authInfo.sso_logout_url
          : `${APP_ROOT}/customerror?type=samlLogoutSuccess`;

      return { redirectURL };
    },

    options: {
      auth: false,
    },
  });
}; //end module
