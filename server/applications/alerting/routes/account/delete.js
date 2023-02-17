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
import { ROUTE_PATH } from '../../../../../common/alerting/constants';
import { ALERTING_BACKEND_BASEURL } from '../../../../../common/alerting/constants';

export const deleteAccount = ({ clusterClient, logger }) => async (context, request, response) => {
  try {
    const { id, type } = request.params;

    const path = `${ALERTING_BACKEND_BASEURL}/account/${type}/${encodeURIComponent(id)}`;

    const { body: resp } = await clusterClient.asScoped(request).asCurrentUser.transport.request({
      method: 'delete',
      path,
    });

    return response.ok({ body: { ok: true, resp } });
  } catch (err) {
    logger.error(`deleteAccount: ${err.stack}`);
    return response.customError(serverError(err));
  }
};

export function deleteAccountRoute({ router, clusterClient, logger }) {
  router.delete(
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
    deleteAccount({ clusterClient, logger })
  );
}
