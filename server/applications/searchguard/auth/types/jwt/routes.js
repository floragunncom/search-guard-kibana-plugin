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
import { APP_ROOT, API_ROOT } from '../../../../../utils/constants';

module.exports = function ({ authInstance, kibanaCore }) {
  const httpResources = kibanaCore.http.resources;
  const router = kibanaCore.http.createRouter();

  router.get(
    {
      // @todo Do we need a route for this?
      path: `${APP_ROOT}/loginTEMPJWT`,
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
  // @todo Disabling for now, conflicting routes
  //customErrorRoute({ httpResources });

  // @todo Remove this, redundant now. Handled by the authManager and authInstance
  router.post(
    {
      path: `${API_ROOT}/auth/logoutJWTTEMP`,
      validate: false,
      options: {
        authRequired: false,
      },
    },
    async (context, request, response) => {
      await authInstance.clear(request);
      return response.ok({
        body: {},
      });
    }
  );
}; //end module
