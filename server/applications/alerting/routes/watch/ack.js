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
import { ROUTE_PATH, NO_MULTITENANCY_TENANT } from '../../../../../common/alerting/constants';
import { ALERTING_BACKEND_BASEURL } from '../../../../../common/alerting/constants';

export function ackWatch({ clusterClient, logger }) {
  return async function (context, request, response) {
    try {
      const {
        params: { watchId, actionId },
        headers: { sp_tenant = NO_MULTITENANCY_TENANT },
      } = request;

      let path = `${ALERTING_BACKEND_BASEURL}/watch/${encodeURIComponent(sp_tenant)}/${encodeURIComponent(watchId)}/_ack`;
      if (actionId) {
        path = `${ALERTING_BACKEND_BASEURL}/watch/${encodeURIComponent(sp_tenant)}/${encodeURIComponent(watchId)}/_ack/${actionId}`;
      }

      const { body: resp } = await clusterClient.asScoped(request).asCurrentUser.transport.request({
        method: 'put',
        path,
      });

      return response.ok({
        body: {
          ok: true,
          resp,
        },
      });
    } catch (err) {
      logger.error(`ackWatch: ${err.stack}`);
      return response.customError(serverError(err));
    }
  };
}

export function ackWatchRoute({ router, clusterClient, logger }) {
  router.put(
    {
      path: `${ROUTE_PATH.WATCH}/{watchId}/_ack/{actionId?}`,
      validate: {
        params: schema.object({
          watchId: schema.string(),
          actionId: schema.maybe(schema.string()),
        }),
      },
    },
    ackWatch({ clusterClient, logger })
  );
}
