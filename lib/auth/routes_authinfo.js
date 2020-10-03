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

import { API_ROOT } from '../../server/utils/constants';

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
