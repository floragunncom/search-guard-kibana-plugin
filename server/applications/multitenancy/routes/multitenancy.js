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
  searchGuardBackend,
  config,
  sessionStorage,
  logger,
}) {
  const router = kibanaCore.http.createRouter();
  const debugEnabled = config.get('searchguard.multitenancy.debug');

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
      const selectedTenant = request.body.tenant;

      const cookie = (await sessionStorage.get(request)) || {};
      cookie.tenant = selectedTenant;
      sessionStorage.set(request, cookie);

      if (debugEnabled) {
        logger.info(`tenant_POST: ${selectedTenant}`);
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
      let selectedTenant = undefined;
      const cookie = await sessionStorage.get(request);
      if (cookie) {
        selectedTenant = cookie.tenant;
      }

      if (debugEnabled) {
        logger.info(`tenant_GET: ${selectedTenant}`);
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
