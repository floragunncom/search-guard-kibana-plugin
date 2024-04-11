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
import { serverError } from '../../lib';
import {
  INDEX,
  ROUTE_PATH,
  DEFAULT_DATEFIELD,
  ES_SCROLL_SETTINGS,
  NO_MULTITENANCY_TENANT,
} from '../../../../../common/signals/constants';
import { GLOBAL_TENANT_NAME } from "../../../../../common/multitenancy";

export const getAlerts = ({ clusterClient, fetchAllFromScroll, logger }) => async (
  context,
  request,
  response
) => {
  try {
    const {
      body: { query, sort, index, scroll },
      headers: { sgtenant },
    } = request;

    const options = { index, scroll };

    if (query && !!Object.keys(query).length) {
      if (sgtenant) {
        if (!query.bool.must) {
          query.bool.must = [];
        }

        // With the new MT implementation we need to be more explicit with the
        // tenant name. Hence, the global tenant is now always SGS_GLOBAL_TENANT.
        // However, for legacy reasons "_main" needs to be used in place of
        // SGS_GLOBAL_TENANT when querying ES directly, such as in this case.
        query.bool.must.push({
          term: {
            'tenant.keyword': { value: (sgtenant === GLOBAL_TENANT_NAME) ? '_main' : sgtenant },
          },
        });
      }

      options.body = { sort, query };
    }

    const firstScrollResponse = await clusterClient
      .asScoped(request)
      .asCurrentUser.search(options);

    const hits = await fetchAllFromScroll({
      clusterClient,
      scroll,
      request,
      response: firstScrollResponse,
    });

    return response.ok({
      body: {
        ok: true,
        resp: hits.map((h) => ({ ...h._source, _id: h._id, _index: h._index })),
      },
    });
  } catch (err) {
    logger.error(`getAlerts: ${err.stack}`);
    return response.customError(serverError(err));
  }
};

export const getAlertsRoute = ({ router, clusterClient, fetchAllFromScroll, logger }) => {
  router.post(
    {
      path: ROUTE_PATH.ALERTS,
      validate: {
        headers: schema.object(
          {
            sgtenant: schema.string({ defaultValue: NO_MULTITENANCY_TENANT }),
          },
          { unknowns: 'allow' }
        ),
        body: schema.object({
          index: schema.string({ defaultValue: INDEX.ALERTS }),
          scroll: schema.string({ defaultValue: ES_SCROLL_SETTINGS.KEEPALIVE }),
          query: schema.object({}, { unknowns: 'allow' }),
          sort: schema.arrayOf(
            schema.object(
              {
                [DEFAULT_DATEFIELD]: schema.string({
                  validate(value) {
                    const accepted = ['desc', 'asc'];
                    if (!accepted.includes(value)) {
                      return `The accepted values: ${accepted.join(', ')}`;
                    }
                  },
                }),
              },
              {
                unknowns: 'allow',
              }
            ),
            {
              defaultValue: {
                [DEFAULT_DATEFIELD]: 'desc',
              },
            }
          ),
        }),
      },
    },
    getAlerts({ clusterClient, fetchAllFromScroll, logger })
  );
};
