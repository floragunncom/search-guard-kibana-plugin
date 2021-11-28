/*
 *    Copyright 2021 floragunn GmbH
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

import { API_ROOT } from '../../../utils/constants';
import { AUTH_TYPE_NAMES } from './AuthManager';
import { customError as customErrorRoute } from './types/common/routes';

export function defineAuthRoutes({ kibanaCore, authManager, searchGuardBackend, configService }) {
  const router = kibanaCore.http.createRouter();
  const httpResources = kibanaCore.http.resources;
  customErrorRoute({ httpResources });

  router.post(
    {
      path: `${API_ROOT}/auth/logout`,
      validate: false,
    },
    logoutHandler({ authManager })
  );

  router.get(
    {
      path: `${API_ROOT}/auth/config`,
      validate: false,
      options: {
        authRequired: false,
      },
    },
    authConfigHandler({ authManager, searchGuardBackend, configService, kibanaCore })
  );

  httpResources.register(
    {
      path: `/auth/captureurlfragment`,
      options: { authRequired: false },
      validate: false,
    },
    (context, request, response) => {
	  const loginHandler = request.url.searchParams.get('loginHandler');

      if (!loginHandler.match(/\/[a-zA-Z0-9\/]+/)) {
         return response.renderHtml({body: 'Bad Request'});
      }

      const authTypeId = request.url.searchParams.get('authTypeId');

      if (authTypeId && !authTypeId.match(/[a-zA-Z0-9]+/)) {
         return response.renderHtml({body: 'Bad Request'});
      }
	
      return response.renderHtml({
        body: `<html><head><script src="captureurlfragment.js"></script></head><body></body></html>`,
      });
    }
  );

  httpResources.register(
    {
      path: `/auth/captureurlfragment.js`,
      options: { authRequired: false },
      validate: false,
    },
    (context, request, response) => {	
      return response.renderJs({
        body: `
          let searchParams = new URLSearchParams(window.location.search);
          let loginHandler = searchParams.get('loginHandler');
          let authTypeId = searchParams.get('authTypeId');
          let nextUrl = searchParams.get('nextUrl');
          if (!nextUrl) nextUrl = "/";
          if (window.location.hash) nextUrl += window.location.hash;
          window.location = loginHandler + "?authTypeId=" + encodeURIComponent(authTypeId) + "&nextUrl=" + encodeURIComponent(nextUrl);
          `,
      });
    }
  );

}

export function logoutHandler({ authManager }) {
  return async function (context, request, response) {
    return authManager.logout({ context, request, response });
  };
}

export function authConfigHandler({ authManager, searchGuardBackend, configService, kibanaCore }) {
  return async function (context, request, response) {
    const authConfig = await searchGuardBackend.getAuthConfig();

    const backendMethodToFrontendMethod = {
      basic: AUTH_TYPE_NAMES.BASIC,
      oidc: AUTH_TYPE_NAMES.OIDC,
      openid: AUTH_TYPE_NAMES.OIDC,
      saml: AUTH_TYPE_NAMES.SAML,
      jwt: AUTH_TYPE_NAMES.JWT,
      link: AUTH_TYPE_NAMES.JWT,
    };

    const authTypes = authConfig.auth_methods
      .filter((config) => authManager.authInstances[backendMethodToFrontendMethod[config.method]])
      .map((config) => {
        const authInstance =
          authManager.authInstances[backendMethodToFrontendMethod[config.method]];
        if (authInstance) {
          let loginURL = authInstance.loginURL;
          if (config.id) {
            // All loginURLs are relative
            loginURL = kibanaCore.http.basePath.get() + authInstance.loginURL + "?authTypeId=" + encodeURIComponent(config.id);
          }

          // For example, we don't have a loginURL flow for JWT. Instead,
          // we can use the sso_location directly
          if (!authInstance.loginURL && config.sso_location) {
            loginURL = config.sso_location;
          }

          return {
            id: config.id,
            type: backendMethodToFrontendMethod[config.method],
            title: config.label,
            loginURL,
            message_body: config.message_body,
			message_title: config.message_title,
			details: config.details,
			unavailable: config.unavailable,
          };
        }
      });

    return response.ok({
      body: {
        authTypes,
        loginPage: authConfig.login_page,
      },
    });
  };
}
