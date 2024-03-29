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

import { serverError } from '../../lib';
import { ROUTE_PATH, PERMISSIONS_FOR_ACCESS } from '../../../../../common/signals/constants';

export function hasPermissions({ logger, searchguardBackendService }) {
  return async function (context, request, response) {
    try {
      const { permissions = {} } = await searchguardBackendService.hasPermissions(
        request.headers,
        PERMISSIONS_FOR_ACCESS
      );

      return response.ok({
        body: {
          ok: true,
          resp: Object.values(permissions).includes(true),
        },
      });
    } catch (err) {
      logger.error(`hasPermissions: ${err.stack}`);
      return response.customError(serverError(err));
    }
  };
}

export function hasPermissionsRoute({ router, logger, searchguardBackendService }) {
  router.post(
    {
      path: ROUTE_PATH.SEARCHGUARD.SIGNALS_HAS_PERMISSIONS,
      options: { authRequired: 'optional' },
      validate: false,
    },
    hasPermissions({ logger, searchguardBackendService })
  );
}
