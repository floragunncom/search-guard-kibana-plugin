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
import {APP_ACCESS_PREFIX, getPermissionsResult} from "./rbac_permissions";

export default function (pluginRoot, server, searchguardBackend) {

    server.ext('onPostAuth', async function(request, h) {

        // Only do this for apps
        if (! request.path.startsWith('/app/')) {
            return h.continue;
        }

        let appId;

        try {
            appId = request.path.split('/')[2];
        } catch(error) {
            server.log(['searchguard', 'error'], `An error occurred while checking RBAC permissions - app id missing`);
            return Boom.notFound();
        }

        try {
            const appPermission = APP_ACCESS_PREFIX + appId;
            const appPermissionResult = await getPermissionsResult(searchguardBackend, request, [appPermission]);

            if (appPermissionResult.hasAllPermissions) {
                return h.continue;
            }

            server.log(['searchguard', 'error'], `Missing permissions for the requested app`);

        } catch(error) {
            server.log(['searchguard', 'error'], `An error occurred while checking RBAC permissions`);
        }

        return Boom.notFound();
    });
}