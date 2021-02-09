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

import { API_ROOT, APP_ROOT } from '../../../utils/constants';

export function authInfoHandler({ searchGuardBackend, logger }) {
  return async function (context, request, response) {
    try {
      const body = await searchGuardBackend.authinfo(request.headers);
      // Avoid Internal IP Disclosure Pattern
      // https://floragunn.atlassian.net/browse/ITT-2387
      delete body.remote_address;
      return response.ok({ body });
    } catch (error) {
      logger.error(`authInfoHandler: ${error.stack}`);
      return response.internalError({ body: error });
    }
  };
}

// @todo PoC - This is the route to the auth type selector page
// This route does not belong in this file
export function defineAuthRoutes({ kibanaCore }) {
  const httpResources = kibanaCore.http.resources;

  httpResources.register(
    {
      // @todo Correct path APPROOT
      path: `/auth`,
      options: { authRequired: false },
      validate: false,
    },
    (context, request, response) => {
      return response.renderHtml({
        body: `
          <html>
            <head>

            </head>
            <body>
                <ul>
                    <li><a href="/login">Basic auth</a></li>
                    <li><a href="/auth/openid/login">OpenId</a></li>
                </ul>
            </body>
          </html>
          `,
      });
    }
  );
}

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
