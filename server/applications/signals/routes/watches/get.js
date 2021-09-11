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
import { getId, serverError } from '../../lib';
import {
  ROUTE_PATH,
  ES_SCROLL_SETTINGS,
  NO_MULTITENANCY_TENANT,
} from '../../../../../common/signals/constants';

export function getWatches({ clusterClient, fetchAllFromScroll, logger }) {
  return async function (context, request, response) {
    try {
      const {
        headers: { sgtenant = NO_MULTITENANCY_TENANT },
        body: { query, scroll },
      } = request;

      const body = {};
      if (query && !!Object.keys(query).length) {
        body.query = query;
      }

      const { body: firstScrollResponse } = await clusterClient
        .asScoped(request)
        .asCurrentUser.transport.request({
          method: 'post',
          path: `/_signals/watch/${encodeURIComponent(sgtenant)}/_search?scroll=${scroll}`,
          body,
        });

      const hits = await fetchAllFromScroll({
        clusterClient,
        scroll,
        request,
        response: firstScrollResponse,
      });

      return response.ok({
        body: {
          ok: true,
          resp: hits.map((h) => ({ ...h._source, _id: getId(h._id) })),
        },
      });
    } catch (err) {
      logger.error(`getWatches: ${err.stack}`);
      return response.customError(serverError(err));
    }
  };
}

export function getWatchesRoute({ router, clusterClient, fetchAllFromScroll, logger }) {
  router.post(
    {
      path: ROUTE_PATH.WATCHES,
      validate: {
        body: schema.object({
          scroll: schema.string({ defaultValue: ES_SCROLL_SETTINGS.KEEPALIVE }),
          query: schema.object({}, { unknowns: 'allow' }),
        }),
      },
    },
    getWatches({ clusterClient, fetchAllFromScroll, logger })
  );
}
