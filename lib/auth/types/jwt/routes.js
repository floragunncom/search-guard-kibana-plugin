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

import { customError as customErrorRoute } from '../common/routes';

module.exports = function (authInstance, searchGuardBackend, APP_ROOT, API_ROOT, kibanaCore) {
  const httpResources = kibanaCore.http.resources;
  const router = kibanaCore.http.createRouter();

  router.get(
    {
      path: `${APP_ROOT}/login`,
      validate: false,
      options: {
        authRequired: false,
      },
    },
    async (context, request, response) => {
      return response.redirected({
        headers: { location: `${APP_ROOT}/customerror` },
      });
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
      authInstance.clear(request);
      return response.ok({
        body: {},
      });
    }
  );
}; //end module
