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
module.exports = function(
  pluginRoot,
  server,
  kbnServer,
  APP_ROOT,
  API_ROOT,
  kibanaCore,
  kibanaConfig
) {
  const config = kibanaConfig;
  const router = kibanaCore.http.createRouter();
  const headers = {
    'content-security-policy': kibanaCore.http.csp.header,
  };

  /**
   * After a logout we are redirected to a login page
   */
  server.route({
    method: 'GET',
    path: `${APP_ROOT}/login`,
    handler(request, h) {
      // The customer may use a login endpoint, to which we can redirect
      // if the user isn't authenticated.
      const loginEndpoint = config.get('searchguard.proxycache.login_endpoint');
      if (loginEndpoint) {
        try {
          const redirectUrl = parseLoginEndpoint(loginEndpoint);
          return h.redirect(redirectUrl);
        } catch (error) {
          server.log(
            ['error', 'searchguard'],
            'An error occured while parsing the searchguard.proxycache.login_endpoint value'
          );
        }
      } else {
        return h.redirect(`${APP_ROOT}/login`);
      }
    },
    options: {
      auth: false,
    },
  });

  /**
   * The error page.
   */
  customErrorRoute({ router, headers });

  server.route({
    method: 'POST',
    path: `${API_ROOT}/auth/logout`,
    handler: request => {
      request.auth.sgSessionStorage.clear();
      return {};
    },
    options: {
      auth: false,
    },
  });
}; //end module
