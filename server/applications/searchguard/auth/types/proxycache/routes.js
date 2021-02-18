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
import { parseLoginEndpoint } from './parse_login_endpoint';
import { customError as customErrorRoute } from '../common/routes';
import { APP_ROOT, API_ROOT } from '../../../../../utils/constants';

module.exports = function ({ authInstance, kibanaCore, kibanaConfig, logger }) {
  const config = kibanaConfig;
  const httpResources = kibanaCore.http.resources;
  const router = kibanaCore.http.createRouter();

  /**
   * After a logout we are redirected to a login page
   */
  router.get(
    {
      path: `${APP_ROOT}/login`,
      validate: false,
      options: {
        authRequired: false,
      },
    },
    async (context, request, response) => {
      // The customer may use a login endpoint, to which we can redirect
      // if the user isn't authenticated.
      const loginEndpoint = config.get('searchguard.proxycache.login_endpoint');
      if (loginEndpoint) {
        try {
          const redirectUrl = parseLoginEndpoint(loginEndpoint);
          return response.redirected({
            headers: { location: redirectUrl },
          });
        } catch (error) {
          logger.error(
            'An error occured while parsing the searchguard.proxycache.login_endpoint value'
          );
        }
      } else {
        // We may have come here from an active logout, in which case
        // "proxycacheLogout" type will be set. This way the user
        // gets a logged out message instead of an error message.
        const customErrorType = request.url.query.type || '';
        return response.redirected({
          headers: { location: `${APP_ROOT}/customerror?type=${customErrorType}` },
        });
      }
    }
  );

  /**
   * The error page.
   */
  customErrorRoute({ httpResources });

  router.post(
    {
      path: `${API_ROOT}/auth/logout`,
      validate: false,
      options: {
        authRequired: false,
      },
    },
    async (context, request, response) => {
      authInstance.sessionStorage.clear(request);

      return response.ok();
    }
  );
}; //end module
