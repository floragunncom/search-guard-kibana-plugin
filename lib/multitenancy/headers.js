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
    const backend = server.plugins.searchguard.getSearchGuardBackend();

    server.ext('onPostAuth', async function (request, next) {

        var selectedTenant = request.state.searchguard_tenant;

        if (request.query && request.query.sg_tenant) {
            // check whether the tenant in the request param is contained in the
            // list of valid tenants from the backend
            let requestedTenant = request.query.sg_tenant;
            let response = await backend.authinfo(request.headers);

            if(response.sg_tenants && response.sg_tenants[requestedTenant]) {
                selectedTenant = requestedTenant;
                next.state('searchguard_tenant', selectedTenant);
            }
        }

        if (selectedTenant != null) {
            assign(request.headers, {'sg_tenant' : selectedTenant});
        }

        return next.continue();
    });
}
