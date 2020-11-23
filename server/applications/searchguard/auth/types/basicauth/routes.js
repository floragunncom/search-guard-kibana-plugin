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

import AuthenticationError from '../../errors/authentication_error';
import MissingTenantError from '../../errors/missing_tenant_error';
import MissingRoleError from '../../errors/missing_role_error';
import { sanitizeNextUrl } from '../../sanitize_next_url';
import { customError as customErrorRoute } from '../common/routes';
import { schema } from '@kbn/config-schema';
import { APP_ROOT, API_ROOT } from '../../../../../utils/constants';

export function loginHandler({ config, authInstance, logger, basePath }) {
  return async function (context, request, response) {
    try {
      // Check if we have alternative login headers
      const alternativeHeaders = config.get('searchguard.basicauth.alternative_login.headers');
      if (alternativeHeaders && alternativeHeaders.length) {
        const requestHeaders = Object.keys(request.headers).map((header) => header.toLowerCase());
        const foundHeaders = alternativeHeaders.filter(
          (header) => requestHeaders.indexOf(header.toLowerCase()) > -1
        );
        if (foundHeaders.length) {
          await authInstance.handleAuthenticateWithHeaders(request);

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
      logger.error(`An error occurred while checking for alternative login headers: ${error}`);

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
  };
}

export function loginAuthHandler({
  config,
  authInstance,
  logger,
  searchGuardBackend,
  sessionStorageFactory,
}) {
  return async function (context, request, response) {
    const username = request.body.username;
    const password = request.body.password;

    try {
      // In order to prevent direct access for certain usernames (e.g. service users like
      // kibanaserver, logstash etc.) we can add them to basicauth.forbidden_usernames.
      // If the username in the payload matches an item in the forbidden array, we throw an AuthenticationError

      const basicAuthConfig = config.get('searchguard.basicauth');
      if (basicAuthConfig.forbidden_usernames && basicAuthConfig.forbidden_usernames.length) {
        if (basicAuthConfig.forbidden_usernames.indexOf(username) > -1) {
          throw new AuthenticationError('Invalid username or password');
        }
      }

      if (basicAuthConfig.allowed_usernames && Array.isArray(basicAuthConfig.allowed_usernames)) {
        try {
          if (basicAuthConfig.allowed_usernames.indexOf(username) === -1) {
            throw new AuthenticationError('Invalid username or password');
          }
        } catch (error) {
          throw new AuthenticationError('Invalid username or password');
        }
      }

      const authHeaderValue = Buffer.from(`${username}:${password}`).toString('base64');
      const { user, session: sessionCookie } = await authInstance.handleAuthenticate(request, {
        authHeaderValue: 'Basic ' + authHeaderValue,
      });

      // handle tenants if MT is enabled
      if (config.get('searchguard.multitenancy.enabled')) {
        // get the preferred tenant of the user
        const globalTenantEnabled = config.get('searchguard.multitenancy.tenants.enable_global');
        const privateTenantEnabled = config.get('searchguard.multitenancy.tenants.enable_private');
        const preferredTenants = config.get('searchguard.multitenancy.tenants.preferred');

        const finalTenant = searchGuardBackend.getTenantByPreference(
          request,
          user.username,
          user.tenants,
          preferredTenants,
          globalTenantEnabled,
          privateTenantEnabled
        );

        sessionCookie.tenant = finalTenant;
        await sessionStorageFactory.asScoped(request).set(sessionCookie);

        return response.ok({
          body: {
            username: user.username,
            tenants: user.tenants,
            roles: user.roles,
            backendroles: user.backendroles,
            selectedTenant: user.selectedTenant,
          },
        });
      } else {
        // no MT, nothing more to do
        return response.ok({
          body: {
            username: user.username,
            tenants: user.tenants,
          },
        });
      }
    } catch (error) {
      logger.error(`Basic auth login authorization ${error.stack}`);
      if (error instanceof AuthenticationError) {
        return response.unauthorized({
          body: {
            message: error.message,
          },
        });
      } else if (error instanceof MissingTenantError) {
        return response.notFound({
          body: {
            message: error.message,
          },
        });
      } else if (error instanceof MissingRoleError) {
        return response.notFound({
          body: {
            message: error.message,
          },
        });
      } else {
        return response.internalError();
      }
    }
  };
}

export function logoutHandler({ authInstance }) {
  return async function (context, request, response) {
    await authInstance.clear(request);
    return response.ok();
  };
}

export function defineRoutes({
  authInstance,
  searchGuardBackend,
  kibanaCore,
  kibanaConfig,
  sessionStorageFactory,
  logger,
}) {
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
    loginHandler({ config, authInstance, logger, basePath })
  );

  router.post(
    {
      path: `${API_ROOT}/auth/login`,
      validate: {
        body: schema.object({
          password: schema.string(),
          username: schema.string(),
        }),
      },
      options: {
        authRequired: false,
      },
    },
    loginAuthHandler({ config, authInstance, logger, searchGuardBackend, sessionStorageFactory })
  );

  router.post(
    {
      path: `${API_ROOT}/auth/logout`,
      validate: false,
    },
    logoutHandler({ authInstance })
  );

  router.get(
    {
      path: `${APP_ROOT}/auth/anonymous`,
      validate: false,
      options: {
        authRequired: false,
      },
    },
    async (context, request, response) => {
      logger.info('Why are we handling anonymous auth?', request.url.path);
      if (config.get('searchguard.auth.anonymous_auth_enabled')) {
        try {
          await authInstance.handleAuthenticate(request, {}, { isAnonymousAuth: true });

          let nextUrl = null;
          if (request.url && request.url.query && request.url.query.nextUrl) {
            nextUrl = sanitizeNextUrl(request.url.query.nextUrl, basePath);
          }

          let redirectTo = basePath + '/app/kibana';

          if (nextUrl) {
            redirectTo = sanitizeNextUrl(nextUrl, basePath);
          }

          return response.redirected({
            headers: { location: redirectTo },
          });
        } catch (error) {
          logger.error(`Basic auth anonymous ${error}`);

          let errorType = 'anonymousAuthError';
          if (error instanceof MissingRoleError) {
            errorType = 'missingRole';
          } else if (error instanceof MissingTenantError) {
            errorType = 'missingTenant';
          }

          const redirectTo = basePath + '/customerror?type=' + errorType;
          return response.redirected({
            headers: { location: redirectTo },
          });
        }
      } else {
        const redirectTo = `${APP_ROOT}/login`;
        return response.redirected({
          headers: { location: redirectTo },
        });
      }
    }
  );
} //end module
