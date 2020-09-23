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
import Joi from 'joi';
import AuthenticationError from '../../errors/authentication_error';
import MissingTenantError from '../../errors/missing_tenant_error';
import MissingRoleError from '../../errors/missing_role_error';
import { sanitizeNextUrl } from '../../sanitize_next_url';
import { customError as customErrorRoute } from '../common/routes';

module.exports = function (
  authInstance,
  searchGuardBackend,
  server,
  APP_ROOT,
  API_ROOT,
  kibanaCore,
  kibanaConfig,
  sessionStorageFactory
) {
  const config = kibanaConfig;
  const basePath = kibanaCore.http.basePath.serverBasePath;
  const httpResources = kibanaCore.http.resources;
  const router = kibanaCore.http.createRouter();

  customErrorRoute({ httpResources });

  /**
   * The login page.
   */
  httpResources.register(
    {
      path: `${APP_ROOT}/login`,
      validate: false,
      options: {
        authRequired: false,
      },
    },
    async (context, request, response) => {
      try {
        // Check if we have alternative login headers
        const alternativeHeaders = config.get('searchguard.basicauth.alternative_login.headers');
        if (alternativeHeaders && alternativeHeaders.length) {
          const requestHeaders = Object.keys(request.headers).map((header) => header.toLowerCase());
          const foundHeaders = alternativeHeaders.filter(
            (header) => requestHeaders.indexOf(header.toLowerCase()) > -1
          );
          if (foundHeaders.length) {
            await authInstance.authenticateWithHeaders(request, request.headers);

            let nextUrl = null;
            if (request.url && request.url.query && request.url.query.nextUrl) {
              nextUrl = sanitizeNextUrl(request.url.query.nextUrl, basePath);
            }

            if (nextUrl) {
              nextUrl = sanitizeNextUrl(nextUrl, basePath);
            } else {
              nextUrl = basePath + '/app/kibana';
            }

            return response.redirected({
              headers: { location: nextUrl },
            });
          }
        }
      } catch (error) {
        server.log(
          ['error', 'searchguard'],
          `An error occurred while checking for alternative login headers: ${error}`
        );

        if (error instanceof MissingRoleError) {
          return response.redirected({
            headers: { location: `${basePath}/customerror?type=missingRole` },
          });
        } else if (error instanceof MissingTenantError) {
          return response.redirected({
            headers: { location: `${basePath}/customerror?type=missingTenant` },
          });
        }
        // Let normal authentication errors through(?) and just go to the regular login page?
      }

      return response.renderAnonymousCoreApp();
    }
  );

  server.route({
    method: 'POST',
    path: `${API_ROOT}/auth/login`,
    async handler(request) {
      try {
        //console.log('What the config?', server.config())
        // In order to prevent direct access for certain usernames (e.g. service users like
        // kibanaserver, logstash etc.) we can add them to basicauth.forbidden_usernames.
        // If the username in the payload matches an item in the forbidden array, we throw an AuthenticationError

        const basicAuthConfig = config.get('searchguard.basicauth');
        if (basicAuthConfig.forbidden_usernames && basicAuthConfig.forbidden_usernames.length) {
          if (
            request.payload &&
            request.payload.username &&
            basicAuthConfig.forbidden_usernames.indexOf(request.payload.username) > -1
          ) {
            throw new AuthenticationError('Invalid username or password');
          }
        }

        if (basicAuthConfig.allowed_usernames && Array.isArray(basicAuthConfig.allowed_usernames)) {
          try {
            const username = request.payload.username;
            if (basicAuthConfig.allowed_usernames.indexOf(username) === -1) {
              throw new AuthenticationError('Invalid username or password');
            }
          } catch (error) {
            throw new AuthenticationError('Invalid username or password');
          }
        }

        const authHeaderValue = Buffer.from(
          `${request.payload.username}:${request.payload.password}`
        ).toString('base64');
        const { user } = await authInstance.handleAuthenticate(request, request.headers, {
          authHeaderValue: 'Basic ' + authHeaderValue,
        });

        // handle tenants if MT is enabled
        if (config.get('searchguard.multitenancy.enabled')) {
          // get the preferred tenant of the user
          const globalTenantEnabled = config.get('searchguard.multitenancy.tenants.enable_global');
          const privateTenantEnabled = config.get(
            'searchguard.multitenancy.tenants.enable_private'
          );
          const preferredTenants = config.get('searchguard.multitenancy.tenants.preferred');

          const finalTenant = searchGuardBackend.getTenantByPreference(
            request,
            user.username,
            user.tenants,
            preferredTenants,
            globalTenantEnabled,
            privateTenantEnabled
          );

          let cookie = await sessionStorageFactory.asScoped(request).get();
          if (!cookie) {
            cookie = {};
          }

          cookie.tenant = finalTenant;

          sessionStorageFactory.asScoped(request).set(cookie);

          return {
            username: user.username,
            tenants: user.tenants,
            roles: user.roles,
            backendroles: user.backendroles,
            selectedTenant: user.selectedTenant,
          };
        } else {
          // no MT, nothing more to do
          return {
            username: user.username,
            tenants: user.tenants,
          };
        }
      } catch (error) {
        server.log(['error', 'searchguard'], `Basic auth login authorization ${error}`);

        if (error instanceof AuthenticationError) {
          throw Boom.unauthorized(error.message);
        } else if (error instanceof MissingTenantError) {
          throw Boom.notFound(error.message);
        } else if (error instanceof MissingRoleError) {
          throw Boom.notFound(error.message);
        } else {
          throw Boom.badImplementation(error.message);
        }
      }
    },

    options: {
      validate: {
        payload: {
          username: Joi.string().required(),
          password: Joi.string().required(),
        },
      },
      auth: false,
    },
  });

  router.post(
    {
      path: `${API_ROOT}/auth/logout`,
      validate: false,
    },
    async (context, request, response) => {
      authInstance.clear(request);

      return response.ok();
    }
  );

  server.route({
    method: 'GET',
    path: `${APP_ROOT}/auth/anonymous`,
    async handler(request, h) {
      if (config.get('searchguard.auth.anonymous_auth_enabled')) {
        try {
          await authInstance.authenticate(request, request.headers, {}, { isAnonymousAuth: true });

          let nextUrl = null;
          if (request.url && request.url.query && request.url.query.nextUrl) {
            nextUrl = sanitizeNextUrl(request.url.query.nextUrl, basePath);
          }

          if (nextUrl) {
            nextUrl = sanitizeNextUrl(nextUrl, basePath);
            return h.redirect(nextUrl);
          }

          return h.redirect(basePath + '/app/kibana');
        } catch (error) {
          server.log(['error', 'searchguard'], `Basic auth anonymous ${error}`);

          let errorType = 'anonymousAuthError';
          if (error instanceof MissingRoleError) {
            errorType = 'missingRole';
          } else if (error instanceof MissingTenantError) {
            errorType = 'missingTenant';
          }

          return h.redirect(basePath + '/customerror?type=' + errorType);
        }
      } else {
        return h.redirect(`${APP_ROOT}/login`);
      }
    },

    options: {
      auth: false,
    },
  });
}; //end module
