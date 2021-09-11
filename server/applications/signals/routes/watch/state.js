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

import { schema } from '@osd/config-schema';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH, NO_MULTITENANCY_TENANT } from '../../../../../common/signals/constants';

export function stateOfWatch({ clusterClient, logger }) {
  return async function (context, request, response) {
    try {
      const {
        params: { id },
        headers: { sgtenant = NO_MULTITENANCY_TENANT },
      } = request;

      const path = `/_signals/watch/${encodeURIComponent(sgtenant)}/${encodeURIComponent(id)}/_state`;
      const { body: resp } = await clusterClient.asScoped(request).asCurrentUser.transport.request({
        method: 'get',
        path,
      });

      return response.ok({ body: { ok: true, resp } });
    } catch (err) {
      logger.error(`stateOfWatch: ${err.stack}`);
      return response.customError(serverError(err));
    }
  };
}

export function stateOfWatchRoute({ router, clusterClient, logger }) {
  router.get(
    {
      path: `${ROUTE_PATH.WATCH}/{id}/_state`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    stateOfWatch({ clusterClient, logger })
  );
}
