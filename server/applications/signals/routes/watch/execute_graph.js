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
import { ROUTE_PATH } from '../../../../../common/signals/constants';

export function executeGraphWatch({ clusterClient, logger }) {
  return async function (context, request, response) {
    try {
      const {
        body: {
          request: { indices: index, body },
        },
      } = request;

      const { body: resp } = await clusterClient.asScoped(request).asCurrentUser.search({
        body,
        index,
      });

      return response.ok({ body: { ok: true, resp } });
    } catch (err) {
      logger.error(`executeGraphWatch: ${err.stack}`);
      return response.customError(serverError(err));
    }
  };
}

export function executeGraphWatchRoute({ router, clusterClient, logger }) {
  router.post(
    {
      path: `${ROUTE_PATH.WATCH}/_execute_graph`,
      validate: {
        body: schema.object({
          request: schema.object(
            {
              indices: schema.arrayOf(schema.string(), { defaultValue: [] }),
              body: schema.object({}, { unknowns: 'allow', defaultValue: {} }),
            },
            {
              defaultValue: {
                indices: [],
                body: {},
              },
            }
          ),
        }),
      },
    },
    executeGraphWatch({ clusterClient, logger })
  );
}
