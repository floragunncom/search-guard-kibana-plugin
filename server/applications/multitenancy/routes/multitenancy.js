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

import { assign } from 'lodash';
import { schema } from '@kbn/config-schema';
import { ensureRawRequest } from '@kbn/core-http-router-server-internal';
import { API_ROOT } from '../../../utils/constants';

export function multitenancyRoutes({
  router,
  searchGuardBackend,
  config,
  sessionStorageFactory,
  logger,
}) {

  const debugEnabled = config.get('searchguard.multitenancy.debug');

  const isMtEnabledInBE = async() => {
    const { kibana_mt_enabled } = await searchGuardBackend.getKibanaInfoWithInternalUser();
    config.set('searchguard.multitenancy.enabled', kibana_mt_enabled)
    return kibana_mt_enabled;
  }

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
      try {
        const isMTEnabled = await isMtEnabledInBE();
        if (!isMTEnabled) {
          return response.notFound();
        }
        const selectedTenant = request.body.tenant;

        const cookie = (await sessionStorageFactory.asScoped(request).get()) || {};
        cookie.tenant = selectedTenant;
        sessionStorageFactory.asScoped(request).set(cookie);

        if (debugEnabled) {
          logger.info(`tenant_POST: ${selectedTenant}`);
        }

        const rawRequest = ensureRawRequest(request);
        assign(rawRequest.headers, { sgtenant: selectedTenant });

        return response.ok({ body: selectedTenant });
      } catch (error) {
        return response.internalError({ body: error });
      }
    }
  );

  router.get(
    {
      path: `${API_ROOT}/multitenancy/tenant`,
      validate: false,
    },
    async (context, request, response) => {
      try {
        const isMTEnabled = await isMtEnabledInBE();
        if (!isMTEnabled) {
          return response.notFound();
        }

        let selectedTenant = undefined;
        const resolvedContext = await context.resolve(['searchGuard']);
        sessionStorageFactory = await resolvedContext.searchGuard.sessionStorageFactory;
        const cookie = await sessionStorageFactory.asScoped(request).get();
        if (cookie) {
          selectedTenant = cookie.tenant;
        }

        if (debugEnabled) {
          logger.info(`tenant_GET: ${selectedTenant}`);
        }

        return response.ok({ body: selectedTenant });
      } catch (error) {

      }

      return response.notFound();

    }
  );

  router.get(
    {
      path: `${API_ROOT}/multitenancy/info`,
      validate: false,
    },
    async (context, request, response) => {
      const isMTEnabled = await isMtEnabledInBE();
      if (!isMTEnabled) {
        return response.notFound();
      }
      const mtinfo = await searchGuardBackend.multitenancyinfo(request.headers);
      return response.ok({ body: mtinfo });
    }
  );
} //end module
