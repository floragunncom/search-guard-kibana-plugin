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
import { getId } from '../../lib/helpers';
import { ROUTE_PATH } from '../../../../../common/signals/constants';

export const getAccount = ({ clusterClient, logger }) => async (context, request, response) => {
  try {
    const { id, type } = request.params;

    const path = `/_signals/account/${type}/${encodeURIComponent(id)}`;

    const {
      body: { _source, _id },
    } = await clusterClient.asScoped(request).asCurrentUser.transport.request({
      method: 'get',
      path,
    });

    return response.ok({
      body: {
        ok: true,
        resp: { ..._source, _id: getId(_id) },
      },
    });
  } catch (err) {
    if (err.statusCode !== 404) {
      logger.error(`getAccount: ${err.stack}`);
    }
    return response.customError(serverError(err));
  }
};

export function getAccountRoute({ router, clusterClient, logger }) {
  router.get(
    {
      path: `${ROUTE_PATH.ACCOUNT}/{type}/{id}`,
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
    getAccount({ clusterClient, logger })
  );
}
