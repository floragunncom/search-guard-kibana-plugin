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

        this.navLinks = server.getUiNavLinks();
        this.navLinkIds = this.navLinks.map(navLink => navLink._id);

        /**
         * Keeps track of the original state of the navlinks,
         * so that we can reset them correctly when switching
         * between tenants or changing permissions
         * @type {object}
         */
        this.originalNavLinkMap = {};
        this.navLinks.forEach((navLink) => {
            this.originalNavLinkMap[navLink._id] = {
                _hidden: navLink._hidden
            };
        });
    }

    /**
     * Maps the navLinks to the corresponding permission and checks the permissions with the SG backend.
     *
     * @param request
     * @param navLinkIds
     * @returns {Promise<{hasAllPermissions: boolean, allowed: Array, missing: Array}>}
     */
    async getPermissionsResult(request, navLinkIds = null) {
        if (navLinkIds === null) {
            navLinkIds = this.navLinkIds;
        }

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

    /**
     * Toggles the navLinks. If a navLink is in the allowed list,
     * the hidden status will be reset to its orginal state,
     * otherwise we set hidden to true
     *
     * @param allowedNavLinkIds
     */
    toggleNavLinkVisibility(allowedNavLinkIds) {
        this.navLinks.forEach((navLink) => {
            const navLinkId = navLink._id;
            if (allowedNavLinkIds.indexOf(navLinkId) === -1) {
                navLink._hidden = true;
            } else {
                try {
                    navLink._hidden = this.originalNavLinkMap[navLink._id]._hidden;
                } catch(error) {
                    // Failed switching back the navLink to its original status
                    console.log('Error while switching back', error)
                }
            }
        });
    }
}