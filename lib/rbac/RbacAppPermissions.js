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


export default class RbacAppPermissions {

    constructor(server, searchguardBackend) {
        this.server = server;
        this.searchguardBackend = searchguardBackend;
    }

    /**
     * Maps the navLinks to the corresponding permission and checks the permissions with the SG backend.
     *
     * @param request
     * @param navLinkIds
     * @returns {Promise<{hasAllPermissions: boolean, allowed: Array, missing: Array}>}
     */
    async getPermissionsResult(request, navLinkIds) {
        // Map navLinkIds to the corresponding permission
        let permissionNameToOriginal = {}
        const appPermissions = navLinkIds.map((linkId) => {
            const permissionName = `kibana:ui:navLinks/${linkId}`;
            permissionNameToOriginal[permissionName] = linkId;
            return permissionName;
        });

        const result = await this.searchguardBackend.hasPermissions(request.headers, appPermissions.join(','));
        const backendPermissions = result.permissions;

        let finalResult = {
            hasAllPermissions: false,
            missing: [],
            allowed: [],
        };

        for (let permission in backendPermissions) {
            const originalPermission = permissionNameToOriginal[permission];
            if (backendPermissions[permission] !== true) {
                finalResult.missing.push(originalPermission);
            } else {
                finalResult.allowed.push(originalPermission);
            }
        }

        if (finalResult.missing.length === 0) {
            finalResult.hasAllPermissions = true;
        }

        return finalResult;
    }
}