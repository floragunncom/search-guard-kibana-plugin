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

import chrome from 'ui/chrome';
import { uiModules } from 'ui/modules';
import uiRoutes from 'ui/routes';
import {isNavLinkAllowed} from "./rbac";
import {chromeWrapper} from "../../services/chrome_wrapper";


/**
 * Most of RBAC lite is handled on the backend side, but there are still some links that we need to change
 * in the frontend, at the moment only for the Kibana apps.
 * @param $window
 */
function enableRbac($window) {
    const injectedDynamic = chrome.getInjected('sgDynamic');
    const path = chrome.removeBasePath($window.location.pathname);

    // don't run on login or logout, we don't have any user on these pages
    if(path === '/login' || path === '/logout' || path === '/customerror') {
        return;
    }

    // @todo Don't think we should skip this if allowedNavLinkIds is broken. Probably hide instead?
    if (injectedDynamic && injectedDynamic.rbac && injectedDynamic.rbac.allowedNavLinkIds) {

        uiRoutes.addSetupWork((kbnBaseUrl) => {
            // There doesn't seem to be a method for getting the current app in the FE without comparing urls
            const matchingNavLinks = chromeWrapper.getNavLinks().filter(navLink => window.location.href.indexOf(navLink.url) === 0);

            // Since searchguard-configuration and searchguard-multitenancy manually hide their respective navLinks
            // as a part of the setup process, it's not enough to just check the hidden flag here. We also need to
            // check the allowed navLinkIds passed from the backend.
            // @todo test if && matchingNavLinks[0].hidden was really needed

            if (matchingNavLinks.length === 1  && !isNavLinkAllowed(matchingNavLinks[0].id, injectedDynamic)) {
                const url = chrome.addBasePath(`${kbnBaseUrl}#/home`);
                window.location.href = url;
            }
        });
    }
}

uiModules.get('searchguard').run(enableRbac);




