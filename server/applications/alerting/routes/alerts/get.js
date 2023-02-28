/*
 * Copyright 2023 Excelerate Technology Limited T/A Eliatra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * *    Copyright 2020 floragunn GmbH
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
import { serverError } from '../../lib';
import {
  INDEX,
  ROUTE_PATH,
  DEFAULT_DATEFIELD,
  ES_SCROLL_SETTINGS,
  NO_MULTITENANCY_TENANT,
} from '../../../../../common/alerting/constants';

export const getAlerts = ({ clusterClient, fetchAllFromScroll, logger }) => async (
  context,
  request,
  response
) => {
  try {
    const {
      body: { query, sort, index, scroll },
      headers: { sp_tenant },
    } = request;

    const options = { index, scroll };

    if (query && !!Object.keys(query).length) {
      // We don't filter alerts by tenant if it is Global tenant (value is '')
      if (sp_tenant) {
        if (!query.bool.must) {
          query.bool.must = [];
        }

        query.bool.must.push({
          term: {
            'tenant.keyword': { value: sp_tenant },
          },
        });
      }

      options.body = { sort, query };
    }

    const { body: firstScrollResponse } = await clusterClient
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
            sp_tenant: schema.string({ defaultValue: NO_MULTITENANCY_TENANT }),
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
