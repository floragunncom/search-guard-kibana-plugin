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
import { serverError } from '../../lib/errors';
import { ROUTE_PATH, NO_MULTITENANCY_TENANT } from '../../../../../common/alerting/constants';
import { ALERTING_BACKEND_BASEURL } from '../../../../../common/alerting/constants';

export function executeWatch({ clusterClient, logger }) {
  return async function (context, request, response) {
    try {
      const {
        body: { watch, simulate = false, skipActions = true, showAllRuntimeAttributes = true },
        headers: { sp_tenant = NO_MULTITENANCY_TENANT },
      } = request;

      const path = `${ALERTING_BACKEND_BASEURL}/watch/${encodeURIComponent(sp_tenant)}/_execute`;

      const { body: resp } = await clusterClient.asScoped(request).asCurrentUser.transport.request({
        method: 'post',
        path,
        body: {
          watch,
          simulate,
          skip_actions: skipActions,
          show_all_runtime_attributes: showAllRuntimeAttributes,
        },
      });

      return response.ok({ body: { ok: true, resp } });
    } catch (err) {
      logger.error(`executeWatch: ${err.stack}`);
      return response.customError(serverError(err));
    }
  };
}

export function executeWatchRoute({ router, clusterClient, logger }) {
  router.post(
    {
      path: `${ROUTE_PATH.WATCH}/_execute`,
      validate: {
        body: schema.object({
          watch: schema.object(
            {
              checks: schema.arrayOf(schema.object({}, { unknowns: 'allow' })),
              actions: schema.arrayOf(schema.object({}, { unknowns: 'allow' })),
              trigger: schema.object({}, { unknowns: 'allow' }),
              _meta: schema.object({}, { unknowns: 'allow' }),
            },
            { unknowns: 'allow' }
          ),
          simulate: schema.boolean({ defaultValue: false }),
          skipActions: schema.boolean({ defaultValue: true }),
          showAllRuntimeAttributes: schema.boolean({ defaultValue: true }),
        }),
      },
    },
    executeWatch({ clusterClient, logger })
  );
}
