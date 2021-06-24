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

import { schema } from '@kbn/config-schema';
import AuthenticationError from '../../errors/authentication_error';
import MissingTenantError from '../../errors/missing_tenant_error';
import MissingRoleError from '../../errors/missing_role_error';
import { sanitizeNextUrl } from '../../sanitize_next_url';
import { customError as customErrorRoute } from '../common/routes';
import { APP_ROOT, API_ROOT } from '../../../../../utils/constants';

export function loginHandler() {
  return async function (context, request, response) {
    return response.renderAnonymousCoreApp();
  };
}

export function loginAuthHandler({ config, authInstance, logger, searchGuardBackend }) {
  return async function (context, request, response) {
    const authMethodName = 'basic';
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


      // We get the authConfig so that we can add a config.id just
      // in case there is an id. This assumes we only have one
      // config for basic auth. If that should change, we should
      // update the LoginPage.js to pass the corresponding id.
      const authConfig = (
        await searchGuardBackend.getAuthConfig(username, password)
      ).auth_methods.find((config) => config.method === authMethodName);
      const credentials = {
        mode: authMethodName,
        user: username,
        password: password,
        id: authConfig.id,
      };

      const { user } = await authInstance.handleAuthenticate(request, credentials);

      // handle tenants if MT is enabled
      if (config.get('searchguard.multitenancy.enabled')) {
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

export function defineRoutes({
  authInstance,
  kibanaCore,
  kibanaConfig,
  logger,
  searchGuardBackend,
}) {
  const config = kibanaConfig;
  const basePath = kibanaCore.http.basePath.serverBasePath;
  const httpResources = kibanaCore.http.resources;
  const router = kibanaCore.http.createRouter();

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
    loginHandler()
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
    loginAuthHandler({ config, authInstance, logger, searchGuardBackend })
  );
} //end module
