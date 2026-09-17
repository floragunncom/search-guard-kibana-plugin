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

import { schema } from '@kbn/config-schema';
import { serverError } from '../../lib/errors';
import { NO_MULTITENANCY_TENANT, ROUTE_PATH } from '../../../../../common/signals/constants';

export const deleteAccount =
  ({ clusterClient, logger, configService, tenantScoped = false }) =>
  async (context, request, response) => {
    try {
      if (tenantScoped && configService.get('searchguard.multitenancy.enabled') !== true) {
        return response.notFound();
      }

      const { id, type } = request.params;
      const { sgtenant = NO_MULTITENANCY_TENANT } = request.headers || {};

      const accountPath = `${encodeURIComponent(type)}/${encodeURIComponent(id)}`;
      const path = tenantScoped
        ? `/_signals/account/${encodeURIComponent(sgtenant)}/${accountPath}`
        : `/_signals/account/${accountPath}`;

      const resp = await clusterClient.asScoped(request).asCurrentUser.transport.request({
        method: 'delete',
        path,
      });

      return response.ok({ body: { ok: true, resp } });
    } catch (err) {
      logger.error(`deleteAccount [${tenantScoped ? 'tenant' : 'global'}]: ${err.stack}`);
      return response.customError(serverError(err));
    }
  };

export function deleteAccountRoute({ router, clusterClient, logger, configService }) {
  const registerRoute = (tenantScoped) => {
    const path = tenantScoped
      ? `${ROUTE_PATH.TENANT_ACCOUNT}/{type}/{id}`
      : `${ROUTE_PATH.ACCOUNT}/{type}/{id}`;

    router.delete(
      {
        path,
        validate: {
          params: schema.object(
            {
              id: schema.string(),
              type: schema.string(),
            },
            { unknowns: 'allow' }
          ),
        },
      },
      deleteAccount({ clusterClient, logger, configService, tenantScoped })
    );
  };

  registerRoute(false);
  registerRoute(true);
}
