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

import Boom from 'boom';
import indexTemplate from '../elasticsearch/setup_index_template';
import { migrateTenant } from './migrate_tenants';

module.exports = function(searchGuardBackend, server, APP_ROOT, API_ROOT, config) {
  // @todo Re-implement
  //const { setupIndexTemplate } = indexTemplate(this, server);
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
    handler: (request, h) => {
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

  server.route({
    method: 'POST',
    path: `${API_ROOT}/multitenancy/migrate/{tenantindex}`,
    handler: async (request, h) => {
      if (!request.params.tenantindex) {
        return h.response(Boom.badRequest, 'Please provide a tenant index name.');
      }
      let forceMigration = false;
      if (request.query.force && request.query.force === 'true') {
        forceMigration = true;
      }
      const result = await migrateTenant(request.params.tenantindex, forceMigration, server);
      return result;
    },
  });
}; //end module
