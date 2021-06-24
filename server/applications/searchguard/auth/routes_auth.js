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
    listAuthTypesHandler({ authManager, searchGuardBackend, configService })
  );
}

export function logoutHandler({ authManager }) {
  return async function (context, request, response) {
    return authManager.logout({ context, request, response });
  };
}

export function listAuthTypesHandler({ authManager, searchGuardBackend, configService }) {
  return async function (context, request, response) {
    // @todo The registered authInstances are most likely not the best source for this.
    // @todo We may have multiple OIDCs, and also the authtype is probably not the best
    // title
    // @todo Use the backend auth config for this

    const username = configService.get('elasticsearch.username');
    const password = configService.get('elasticsearch.password');
    const authConfig = (await searchGuardBackend.getAuthConfig(username, password));

    //console.log('What the authConfig?', authConfig);

    // @todo Figure out if this is really necessary
    // @todo Maybe we should refactor our code to support the SG auth type name without any map?
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
            loginURL = new URL(authInstance.loginURL, 'http://abc');
            loginURL.searchParams.set('authTypeId', config.id);
            loginURL = loginURL.href.replace(loginURL.origin, '');
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
            message: config.message,
          };
        }
      });

    return response.ok({
      body: {
        authTypes,
        loginPage: authConfig.login_page
      },
    });
  };
}

/*
export function defineAuthInfoRoutes({ searchGuardBackend, kibanaCore, logger }) {
  const router = kibanaCore.http.createRouter();

  router.get(
    {
      path: `${API_ROOT}/auth/authinfo`,
      validate: false,
      options: {
        authRequired: true,
      },
    },
    authInfoHandler({ searchGuardBackend, logger })
  );
} // end module

 */
