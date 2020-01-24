/**
 *    Copyright 2020 floragunn GmbH

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
import { APP_NAME as signalsName, PERMISSIONS_FOR_ACCESS } from '../../../../utils/signals/constants';

async function checkAllPermissions(requestHeaders, permissions, searchguardBackend) {
  const permissionsString = permissions.join(',');
  const permissionsResult = await searchguardBackend.hasPermissions(requestHeaders, permissionsString);

  let hasAllPermissions = true;
  Object.keys(permissionsResult.permissions).forEach((permissionString) => {
    if (permissionsResult.permissions[permissionString] !== true) {
      hasAllPermissions = false;
    }
  });

  return hasAllPermissions;
}

export function handleSignalsApp(server, searchguardBackend) {

  server.ext('onPostAuth', async (request, h) => {

    // Only do this for apps
    if (!request.path.startsWith('/app/')) {
      return h.continue;
    }

    try {
      const id = request.params.id;
      const app = server.getUiAppById(id);
      if (app.getId() === signalsName) {
        const hasAllPermissions = await checkAllPermissions(request.headers, PERMISSIONS_FOR_ACCESS, searchguardBackend);
        if (!hasAllPermissions) {
          return Boom.unauthorized();
        }
      }
    } catch(error) {
      // Ignore
    }

    return h.continue;
  });
}

export function handleSignalsNavLink(server, searchguardBackend) {
  server.registerCapabilitiesModifier(async (request, uiCapabilities) => {
    // We need to have an authenticated user to perform the hasPermissions check
    if (!request.path.startsWith('/app')) {
      return uiCapabilities;
    }

    const hasAllPermissions = await checkAllPermissions(request.headers, PERMISSIONS_FOR_ACCESS, searchguardBackend);

    uiCapabilities.navLinks[signalsName] = hasAllPermissions;

    return uiCapabilities;
  });
}

export function handleSignalsAppAccess(server, searchguardBackend) {
  handleSignalsNavLink(server, searchguardBackend);
  handleSignalsApp(server, searchguardBackend);
}
