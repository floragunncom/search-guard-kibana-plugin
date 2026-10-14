/*
 *    Copyright 2026 floragunn GmbH
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

import { serverError } from '../../lib';
import { ROUTE_PATH } from '../../../../../common/signals/constants';

// Lists the stored Signals HTTP proxies ({ id, name, uri }) that actions can reference by id.
export function getProxies({ clusterClient, logger }) {
  return async function (context, request, response) {
    try {
      const { data = [] } = await clusterClient.asScoped(request).asCurrentUser.transport.request({
        method: 'get',
        path: '/_signals/proxies',
      });

      return response.ok({ body: { ok: true, resp: data } });
    } catch (err) {
      logger.error(`getProxies: ${err.stack}`);
      return response.customError(serverError(err));
    }
  };
}

export function getProxiesRoute({ router, clusterClient, logger }) {
  router.get(
    {
      path: ROUTE_PATH.PROXIES,
      validate: false,
    },
    getProxies({ clusterClient, logger })
  );
}
