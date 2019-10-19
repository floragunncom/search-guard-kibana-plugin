/**
 *    Copyright 2019 floragunn GmbH

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
import {API_ACCESS_PREFIX, getPermissionsResult} from "./rbac_permissions";

export default function (pluginRoot, server, searchguardBackend) {

    server.ext('onPostAuth', async function(request, h) {

        // Only do this for apps
        if (! request.path.startsWith('/api/') || !request.route.settings || !request.route.settings.tags) {
            return h.continue;
        }

        try {
            // Currently, only tags with the access: prefix are used for authorization
            let requiredPermissions = route.settings.tags.filter(routeTag => routeTag.startsWith(API_ACCESS_PREFIX));

            if (requiredPermissions.length === 0 || await getPermissionsResult(searchguardBackend, request, requiredPermissions).hasAllPermissions) {
                return h.continue;
            }

            server.log(['searchguard', 'error'], `Missing permissions for the requested api endpoint`);
        } catch(error) {
            server.log(['searchguard', 'error'], `An error occurred while checking RBAC permissions`);
        }

        return Boom.notFound();
    });


}

