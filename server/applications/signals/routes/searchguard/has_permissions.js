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
import {
  ROUTE_PATH,
  PERMISSIONS_FOR_ACCESS,
  TENANT_ACCOUNT_PERMISSIONS,
} from '../../../../../common/signals/constants';

const permissionsToCheck = [
  ...PERMISSIONS_FOR_ACCESS,
  ...Object.values(TENANT_ACCOUNT_PERMISSIONS),
];

export function hasPermissions({ logger, searchguardBackendService }) {
  return async function (context, request, response) {
    try {
      const { permissions = {} } = await searchguardBackendService.hasPermissions(
        request.headers,
        permissionsToCheck
      );

      return response.ok({
        body: {
          ok: true,
          resp: {
            signals: PERMISSIONS_FOR_ACCESS.some((permission) => permissions[permission] === true),
            tenantAccounts: {
              read: [TENANT_ACCOUNT_PERMISSIONS.GET, TENANT_ACCOUNT_PERMISSIONS.SEARCH].every(
                (permission) => permissions[permission] === true
              ),
              manage: Object.values(TENANT_ACCOUNT_PERMISSIONS).every(
                (permission) => permissions[permission] === true
              ),
            },
          },
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
      validate: false,
      security: {
        authc: {
          enabled: 'optional',
          reason: 'Route checks Search Guard Signals permissions before and after authentication.',
        },
        authz: {
          enabled: false,
          reason: 'Route delegates authorization to Search Guard permission checks.',
        },
      },
    },
    hasPermissions({ logger, searchguardBackendService })
  );
}
