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

import { get } from 'lodash';
import {assign} from 'lodash';

export default function (pluginRoot, server, APP_ROOT, API_ROOT) {

    const config = server.config();
    const basePath = config.get('server.basePath');
    const global_enabled = config.get("searchguard.multitenancy.tenants.enable_global");
    const private_enabled = config.get("searchguard.multitenancy.tenants.enable_private");
    const preferredTenants = config.get("searchguard.multitenancy.tenants.preferred");
    const headersWhiteList = config.get("elasticsearch.requestHeadersWhitelist");
    const backend = server.plugins.searchguard.getSearchGuardBackend();

    server.ext('onPostAuth', async function (request, next) {

        const selectedTenantQueryParam = get(request.query, 'sg_tenant', get(request.query, 'sgtenant', null));
        const selectedTenantHeader = get(request.headers, 'sg_tenant', get(request.headers, 'sgtenant', null));
        const externalTenant = selectedTenantQueryParam? selectedTenantQueryParam:selectedTenantHeader;

        if (!request.path.startsWith("/elasticsearch") && !request.path.startsWith("/api") && !request.path.startsWith("/app") && !externalTenant) {
            return next.continue();
        }

        // default is the tenant stored in the tenants cookie
        var selectedTenant = request.state.searchguard_tenant;

       // check if someone passed in a tenant as HTTP header or query param
        if(externalTenant) {
            selectedTenant = externalTenant;
        }

        var response;

        try {
            response = await backend.authinfo(request.headers);
        } catch(error) {
            return next.continue();
        }

        // if we have a tenant, check validity and set it
        if (selectedTenant) {
            selectedTenant = backend.validateTenant(response.user_name, selectedTenant, response.sg_tenants, global_enabled, private_enabled);
            if(selectedTenant != null) {
                // save validated tenant as preference
                let prefcookie = backend.updateAndGetTenantPreferences(request, response.user_name, selectedTenant);
                next.state('searchguard_tenant', selectedTenant)
                next.state('searchguard_preferences', prefcookie);
            }
        }

        // either no tenant specified or the specified tenant was not valid. Use preferred one, or first in the list
        if(!selectedTenant) {
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
