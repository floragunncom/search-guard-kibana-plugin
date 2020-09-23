/* eslint-disable @kbn/eslint/require-license-header */
/**
 *    Copyright 2016 floragunn GmbH

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

import { API_ROOT } from '../../../utils/constants';
import { schema } from '@kbn/config-schema';

export function multitenancyRoutes({
  kibanaCore,
  server,
  searchGuardBackend,
  config,
  sessionStorageFactory,
}) {
  const router = kibanaCore.http.createRouter();
  const debugEnabled = config.get('searchguard.multitenancy.debug');
  //const preferencesCookieName = config.get('searchguard.cookie.preferences_cookie_name');

  router.post(
    {
      path: `${API_ROOT}/multitenancy/tenant`,
      validate: {
        body: schema.object({
          tenant: schema.string(),
          username: schema.string(),
        }),
      },
    },
    async (context, request, response) => {
      const username = request.body.username;
      const selectedTenant = request.body.tenant;
      console.log('**** In the route, context is:', context, context.sg_np.something());

      // @todo Is this still needed?
      const prefs = searchGuardBackend.updateAndGetTenantPreferences(
        request,
        username,
        selectedTenant
      );

      const cookie = (await sessionStorageFactory.asScoped(request).get()) || {};
      cookie.tenant = selectedTenant;
      sessionStorageFactory.asScoped(request).set(cookie);

      if (debugEnabled) {
        // @todo UPDATE LOG
        request.log(['info', 'searchguard', 'tenant_POST'], selectedTenant);
      }

      return response.ok({ body: selectedTenant });
    }
  );

  router.get(
    {
      path: `${API_ROOT}/multitenancy/tenant`,
      validate: false,
    },
    async (context, request, response) => {
      let selectedTenant = '';
      const cookie = await sessionStorageFactory.asScoped(request).get();
      console.log('Got cookie?', cookie);
      if (cookie) {
        selectedTenant = cookie.tenant || '';
      }

      if (debugEnabled) {
        // @todo UPDATE LOG
        request.log(['info', 'searchguard', 'tenant_GET'], selectedTenant);
      }

      return response.ok({ body: selectedTenant });
    }
  );

  router.get(
    {
      path: `${API_ROOT}/multitenancy/info`,
      validate: false,
    },
    async (context, request, response) => {
      const mtinfo = await searchGuardBackend.multitenancyinfo(request.headers);
      return response.ok({ body: mtinfo });
    }
  );
} //end module
