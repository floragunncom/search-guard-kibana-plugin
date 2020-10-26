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
import { getId } from '../../lib/helpers';
import { ROUTE_PATH, ES_SCROLL_SETTINGS } from '../../../../../common/signals/constants';

export const getAccounts = ({ clusterClient, fetchAllFromScroll, logger }) => async (
  context,
  request,
  response
) => {
  try {
    const {
      body: { query, scroll },
    } = request;

    const body = {};
    if (query && !!Object.keys(query).length) {
      body.query = query;
    }

    const firstScrollResponse = await clusterClient
      .asScoped(request)
      .callAsCurrentUser('sgSignals.getAccounts', { scroll, body });

    const hits = await fetchAllFromScroll({
      clusterClient,
      scroll,
      request,
      response: firstScrollResponse,
    });

    return response.ok({
      body: {
        ok: true,
        resp: hits.map(({ _source, _id }) => ({ ..._source, _id: getId(_id) })),
      },
    });
  } catch (err) {
    logger.error(`getAccounts: ${err.stack}`);
    return response.ok({ body: { ok: false, resp: serverError(err) } });
  }
};

export function getAccountsRoute({ router, clusterClient, fetchAllFromScroll, logger }) {
  router.post(
    {
      path: ROUTE_PATH.ACCOUNTS,
      validate: {
        body: schema.object(
          {
            scroll: schema.string({ defaultValue: ES_SCROLL_SETTINGS.KEEPALIVE }),
            query: schema.object({}, { unknowns: 'allow' }),
          },
          { unknowns: 'allow' }
        ),
      },
    },
    getAccounts({ clusterClient, fetchAllFromScroll, logger })
  );
}
