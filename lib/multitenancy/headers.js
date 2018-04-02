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

import {assign} from 'lodash';

export default function (pluginRoot, server, APP_ROOT, API_ROOT) {

    const config = server.config();
    const basePath = config.get('server.basePath');
    const global_enabled = config.get("searchguard.multitenancy.tenants.enable_global");
    const private_enabled = config.get("searchguard.multitenancy.tenants.enable_private");
    const preferredTenants = config.get("searchguard.multitenancy.tenants.preferred");
    const backend = server.plugins.searchguard.getSearchGuardBackend();

    server.ext('onPostAuth', async function (request, next) {

        // default is the tenant stored in the tenants cookie
        var selectedTenant = request.state.searchguard_tenant;

        // check for tenant information in HTTP header. E.g. when using the saved objects API
        if(request.headers.sgtenant || request.headers.sg_tenant) {
            selectedTenant = request.headers.sgtenant? request.headers.sgtenant : request.headers.sg_tenant;
        }

        // check for tenant information in GET parameter. E.g. when using a share link. Overwrites the HTTP header.
        if (request.query && (request.query.sg_tenant || request.query.sgtenant)) {
            selectedTenant = request.query.sg_tenant? request.query.sg_tenant : request.query.sgtenant;
        }

        let response = await backend.authinfo(request.headers);

        // if we have a tenant, check validity and set it
        if (selectedTenant) {
            selectedTenant = backend.validateTenant(response.user_name, selectedTenant, response.sg_tenants, global_enabled, private_enabled);
            if(selectedTenant != null) {
                // save validated tenant as preference
                let prefcookie = backend.updateAndGetTenantPreferences(request, response.user_name, selectedTenant);
                next.state('searchguard_tenant', selectedTenant)
                next.state('searchguard_preferences', prefcookie);
            }
        } else {
            // no tenant, choose configured, preferred tenant
            try {
                selectedTenant = backend.getTenantByPreference(request, response.user_name, response.sg_tenants, preferredTenants, global_enabled, private_enabled);
                if(selectedTenant != null) {
                    // save validated tenant as preference
                    let prefcookie = backend.updateAndGetTenantPreferences(request, response.user_name, selectedTenant);
                    next.state('searchguard_tenant', selectedTenant)
                    next.state('searchguard_preferences', prefcookie);
                }
            } catch(error) {
                // nothing
            }
        }

        if (selectedTenant != null) {
            assign(request.headers, {'sgtenant' : selectedTenant});
        }

        return next.continue();
    });
}
