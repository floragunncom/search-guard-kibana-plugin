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
import { ROUTE_PATH, INDEX } from '../../../../../utils/signals/constants';

export const deleteAlert = ({ clusterClient, logger }) => async (context, request, response) => {
  try {
    const { id, index } = request.params;

    const resp = await clusterClient.asScoped(request).callAsCurrentUser('delete', {
      refresh: true,
      type: INDEX.ALERT_DOC_TYPE,
      index,
      id: id.replace('%2F'),
    });

    return response.ok({ body: { ok: resp.result === 'deleted', resp } });
  } catch (err) {
    logger.error(`deleteAlert: ${err.stack}`);
    return response.ok({ body: { ok: false, resp: serverError(err) } });
  }
};

export function deleteAlertRoute({ router, clusterClient, logger }) {
  router.delete(
    {
      path: `${ROUTE_PATH.ALERT}/{index}/{id}`,
      validate: {
        params: schema.object(
          {
            id: schema.string(),
            index: schema.string(),
          },
          { unknowns: 'allow' }
        ),
      },
    },
    deleteAlert({ clusterClient, logger })
  );
}
