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

import Boom from 'boom';
import { sanitizeNextUrl } from '../../sanitize_next_url';
import MissingTenantError from '../../errors/missing_tenant_error';
import AuthenticationError from '../../errors/authentication_error';
import { customError as customErrorRoute } from '../common/routes';

module.exports = function(
  searchGuardBackend,
  server,
  APP_ROOT,
  API_ROOT,
  kibanaCore,
  kibanaConfig
) {
  const config = kibanaConfig;
  const basePath = kibanaCore.http.basePath.serverBasePath;
  const router = kibanaCore.http.createRouter();
  const headers = {
    'content-security-policy': kibanaCore.http.csp.header,
  };

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
        request.auth.sgSessionStorage.putStorage('temp-saml', {
          requestId: samlHeader.requestId,
          nextUrl: nextUrl,
        });

        return h.redirect(samlHeader.location).takeover();
      } catch (error) {
        return h.redirect(basePath + '/customerror?type=samlConfigError');
      }
    },
  });

  /**
   * The page that the IdP redirects to after a successful SP-initiated login
   */
  server.route({
    method: 'POST',
    path: `${APP_ROOT}/searchguard/saml/acs`,
    options: {
      auth: false,
    },
    handler: async (request, h) => {
      const storedRequestInfo = request.auth.sgSessionStorage.getStorage('temp-saml', {});
      request.auth.sgSessionStorage.clearStorage('temp-saml');

      if (!storedRequestInfo.requestId) {
        return h.redirect(basePath + '/customerror?type=samlAuthError');
      }

      try {
        const credentials = await searchGuardBackend
          .authtoken(storedRequestInfo.requestId || null, request.payload.SAMLResponse);

        const { user } = await request.auth.sgSessionStorage.authenticate({
          authHeaderValue: credentials.authorization,
        });

        let nextUrl = storedRequestInfo.nextUrl;

        if (nextUrl) {
          nextUrl = sanitizeNextUrl(nextUrl, basePath);
          return h.redirect(nextUrl);
        }

        return h.redirect(basePath + '/app/kibana');
      } catch (error) {
        if (error instanceof AuthenticationError) {
          return h.redirect(basePath + '/customerror?type=samlAuthError');
        } else if (error instanceof MissingTenantError) {
          return h.redirect(basePath + '/customerror?type=missingTenant');
        } else {
          return h.redirect(basePath + '/customerror?type=samlAuthError');
        }
      }
    },
  });

  /**
   * The page that the IdP redirects to after a successful IdP-initiated login
   */
  server.route({
    method: 'POST',
    path: `${APP_ROOT}/searchguard/saml/acs/idpinitiated`,
    options: {
      auth: false,
    },
    handler: async (request, h) => {
      try {
        const acsEndpoint = `${APP_ROOT}/searchguard/saml/acs/idpinitiated`;
        const credentials = await searchGuardBackend
          .authtoken(null, request.payload.SAMLResponse, acsEndpoint);

        const { user } = await request.auth.sgSessionStorage.authenticate({
          authHeaderValue: credentials.authorization,
        });

        return h.redirect(basePath + '/app/kibana');
      } catch (error) {
        if (error instanceof AuthenticationError) {
          return h.redirect(basePath + '/customerror?type=samlAuthError');
        } else if (error instanceof MissingTenantError) {
          return h.redirect(basePath + '/customerror?type=missingTenant');
        } else {
          return h.redirect(basePath + '/customerror?type=samlAuthError');
        }
      }
    },
  });

  /**
   * The custom error page.
   */
  server.route({
    method: ['GET', 'POST'],
    path: `${APP_ROOT}/searchguard/saml/logout`,
    handler(request, h) {
      return h.redirect(`${APP_ROOT}/customerror?type=samlLogoutSuccess`);
    },
    options: {
      auth: false,
    },
  });

  /**
   * The custom error page.
   */
  customErrorRoute({ router, headers });

  /**
   * Logout
   */
  server.route({
    method: 'POST',
    path: `${API_ROOT}/auth/logout`,
    handler: async request => {
      const cookieName = config.get('searchguard.cookie.name');
      let authInfo = null;

      try {
        const authHeader = {
          [request.auth.sgSessionStorage.getAuthHeaderName()]: request.state[cookieName].credentials
            .authHeaderValue,
        };
        authInfo = await searchGuardBackend.authinfo(authHeader);
      } catch (error) {
        // Not much we can do here, so we'll just fall back to the login page if we don't get an sso_logout_url
      }

      request.auth.sgSessionStorage.clear();
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
