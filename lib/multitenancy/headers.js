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

export default function (pluginRoot, server, kbnServer, APP_ROOT, API_ROOT, authClass) {

    const config = server.config();
    const basePath = config.get('server.basePath');
    const global_enabled = config.get("searchguard.multitenancy.tenants.enable_global");
    const private_enabled = config.get("searchguard.multitenancy.tenants.enable_private");
    const preferredTenants = config.get("searchguard.multitenancy.tenants.preferred");
    const debugEnabled = config.get("searchguard.multitenancy.debug");
    const backend = server.plugins.searchguard.getSearchGuardBackend();

    const defaultSpaceId = 'default';

    server.ext('onPreAuth', async function (request, h) {

        // default is the tenant stored in the tenants cookie
        const storedSelectedTenant = request.auth.sgSessionStorage.getStorage('tenant', {}).selected;
        let selectedTenant = storedSelectedTenant;

        if (debugEnabled) {
            request.log(['info', 'searchguard', 'tenant_storagecookie'], selectedTenant);
        }

        // check for tenant information in HTTP header. E.g. when using the saved objects API
        if(request.headers.sgtenant || request.headers.sg_tenant) {
            selectedTenant = request.headers.sgtenant? request.headers.sgtenant : request.headers.sg_tenant;

            if (debugEnabled) {
                request.log(['info', 'searchguard', 'tenant_http_header'], selectedTenant);
            }

        }

        // check for tenant information in GET parameter. E.g. when using a share link. Overwrites the HTTP header.
        if (request.query && (request.query.sg_tenant || request.query.sgtenant)) {
            selectedTenant = request.query.sg_tenant? request.query.sg_tenant : request.query.sgtenant;

            if (debugEnabled) {
                request.log(['info', 'searchguard', 'tenant_url_param'], selectedTenant);
            }

        }

        // MT is only relevant for these paths
        if (!request.path.startsWith("/elasticsearch") && !request.path.startsWith("/api") && !request.path.startsWith("/app") && request.path != "/" && !selectedTenant) {
            return h.continue;
        }

        var response;

        try {
            if (authClass) {
                authClass.assignAuthHeader(request);
            }

            response = await request.auth.sgSessionStorage.getAuthInfo(request.headers);
        } catch(error) {
            return h.continue;
        }

        // if we have a tenant, check validity and set it
        if (typeof selectedTenant !== 'undefined' && selectedTenant !== null) {
            selectedTenant = backend.validateTenant(response.user_name, selectedTenant, response.sg_tenants, global_enabled, private_enabled);
        } else {
            // no tenant, choose configured, preferred tenant
            try {
                selectedTenant = backend.getTenantByPreference(request, response.user_name, response.sg_tenants, preferredTenants, global_enabled, private_enabled);
            } catch(error) {
                // nothing
            }
        }

        if(selectedTenant != storedSelectedTenant) {
            // save validated tenant as preference
            let prefcookie = backend.updateAndGetTenantPreferences(request, response.user_name, selectedTenant);
            request.auth.sgSessionStorage.putStorage('tenant', {
                selected: selectedTenant
            });
            h.state('searchguard_preferences', prefcookie);
        }

        if (debugEnabled) {
            request.log(['info', 'searchguard', 'tenant_assigned'], selectedTenant);
        }

        if (selectedTenant != null) {
            assign(request.headers, {'sgtenant' : selectedTenant});
        }


        // Test for default space?
        if (config.has('xpack.spaces.enabled') && config.get('xpack.spaces.enabled') && (request.path === '/' || request.path.startsWith('/app'))) {

            // We can't add a default space for RO tenants at the moment
            if (selectedTenant && response.sg_tenants[selectedTenant] === false) {
                return h.continue;
            }

            const spacesClient = server.plugins.spaces.spacesClient.getScopedClient(request);
            let defaultSpace = null;

            try {
                defaultSpace = await spacesClient.get(defaultSpaceId)
            } catch(error) {
                // Most likely not really an error, default space just not found
            }

            if (defaultSpace === null) {
                try {
                    await spacesClient.create({
                       id: defaultSpaceId,
                       name: 'Default',
                       description: 'This is your default space!',
                       color: '#00bfb3',
                       _reserved: true
                    });
                } catch(error) {
                    server.log(['searchguard', 'error'], `An error occurred while creating a default space`);
                }
            }
        }

        return h.continue;
    });
}
