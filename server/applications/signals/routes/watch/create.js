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
import { ROUTE_PATH, NO_MULTITENANCY_TENANT } from '../../../../../common/signals/constants';

export function createWatch({ clusterClient, logger }) {
  return async function (context, request, response) {
    try {
      const {
        body,
        params: { id },
        headers: { sgtenant = NO_MULTITENANCY_TENANT },
      } = request;

      const path = `/_signals/watch/${encodeURIComponent(sgtenant)}/${encodeURIComponent(id)}`;

      const { body: resp } = await clusterClient.asScoped(request).asCurrentUser.transport.request({
        method: 'put',
        path,
        body,
      });

      return response.ok({ body: { ok: true, resp } });
    } catch (err) {
      logger.error(`createWatch: ${err.stack}`);
      return response.customError(serverError(err));
    }
  };
}

export function createWatchRoute({ router, clusterClient, logger }) {
  router.put(
    {
      path: `${ROUTE_PATH.WATCH}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        body: schema.object(
          {
            actions: schema.arrayOf(schema.object({}, { unknowns: 'allow' })),
            checks: schema.arrayOf(schema.object({}, { unknowns: 'allow' })),
            trigger: schema.object({}, { unknowns: 'allow' }),
            _meta: schema.object({}, { unknowns: 'allow' }), // ES plugin meta
            _ui: schema.object({}, { unknowns: 'allow' }), // UI meta
            active: schema.boolean(),
            log_runtime_data: schema.maybe(schema.boolean()),
          },
          { unknowns: 'allow' }
        ),
      },
    },
    createWatch({ clusterClient, logger })
  );
}
