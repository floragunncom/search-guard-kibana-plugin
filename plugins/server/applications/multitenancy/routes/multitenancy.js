/* eslint-disable @kbn/eslint/require-license-header */
/**
 *    Copyright 2016 floragunn GmbH

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import { API_ROOT } from '../../../utils/constants';

export function multitenancyRoutes({ server, searchGuardBackend, config }) {
  const debugEnabled = config.get('searchguard.multitenancy.debug');
  const preferencesCookieName = config.get('searchguard.cookie.preferences_cookie_name');

  server.route({
    method: 'POST',
    path: `${API_ROOT}/multitenancy/tenant`,
    handler: (request, h) => {
      const username = request.payload.username;
      const selectedTenant = request.payload.tenant;
      const prefs = searchGuardBackend.updateAndGetTenantPreferences(request, username, selectedTenant);

      request.auth.sgSessionStorage.putStorage('tenant', {
        selected: selectedTenant,
      });

      if (debugEnabled) {
        request.log(['info', 'searchguard', 'tenant_POST'], selectedTenant);
      }

      return h.response(request.payload.tenant).state(preferencesCookieName, prefs);
    },
  });

  server.route({
    method: 'GET',
    path: `${API_ROOT}/multitenancy/tenant`,
    handler: request => {
      const selectedTenant = request.auth.sgSessionStorage.getStorage('tenant', {}).selected;

      if (debugEnabled) {
        request.log(['info', 'searchguard', 'tenant_GET'], selectedTenant);
      }

      return selectedTenant;
    },
  });

  server.route({
    method: 'GET',
    path: `${API_ROOT}/multitenancy/info`,
    handler: request => {
      const mtinfo = searchGuardBackend.multitenancyinfo(request.headers);
      return mtinfo;
    },
  });
} //end module
