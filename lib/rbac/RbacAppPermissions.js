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

import {mapValues, isObject} from 'lodash';

export const UICAPABILITY_PREFIX = 'kibana:ui:';

/**
 * Walks through the given source object
 * and recursively creates a new object
 * with the original values. The value
 * can be modified through the passed
 * callback function
 * @param obj
 * @param modifierCallback
 * @param path
 * @returns {NumericDictionary<any>}
 */
const mapValuesDeep = (obj, modifierCallback, path = '') => {
  return mapValues(obj, (val, key) => {
      let currentPath = (path) ? path + '/' + key : key;
      return isObject(val)
        ? mapValuesDeep(val, modifierCallback, currentPath)
        : modifierCallback(val, key, obj, currentPath)
    }
  )
}

export function buildPermissionsFromCapabilities(uiCapabilities) {
    let permissions = [];

    mapValuesDeep(uiCapabilities, (value, key, obj, path) => {
        permissions.push(UICAPABILITY_PREFIX + path);
        return value;
    });

    return permissions;
}

export function toggleUiCapabilities(uiCapabilities, appPermissionsResult) {
    const result = mapValuesDeep(uiCapabilities, (value, key, obj, path) => {
        if (value === false) {
            return false;
        }

        const permissionString = UICAPABILITY_PREFIX + path;

        if(appPermissionsResult.allowed.indexOf(permissionString) < 0) {
            return false;
        }

        return value;
    });

    return result;
}

// @todo Class not really needed anymore
export class RbacAppPermissions {

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
    async getPermissionsResult(request, appPermissions) {

        const result = await this.searchguardBackend.hasPermissions(request.headers, appPermissions.join(','));
        const backendPermissions = result.permissions;

        console.log(backendPermissions, appPermissions.join(','))

        let finalResult = {
            hasAllPermissions: false,
            missing: [],
            allowed: [],
        };

        for (let permission in backendPermissions) {

            if (backendPermissions[permission] !== true) {
                finalResult.missing.push(permission);
            } else {
                finalResult.allowed.push(permission);
            }
        }

        if (finalResult.missing.length === 0) {
            finalResult.hasAllPermissions = true;
        }

        return finalResult;
    }
}