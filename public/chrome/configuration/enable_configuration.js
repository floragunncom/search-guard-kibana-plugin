/**
 *    Copyright 2017 floragunn GmbH

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

require ('../../apps/configuration/systemstate/systemstate');

export function enableConfiguration($http, $window, systemstate) {

    chrome.getNavLinkById("searchguard-configuration").hidden = true;

    const ROOT = chrome.getBasePath();
    const APP_ROOT = `${ROOT}`;
    const API_ROOT = `${APP_ROOT}/api/v1`;
    const path = chrome.removeBasePath($window.location.pathname);

    // don't run on login or logout, we don't have any user on these pages
    if(path === '/login' || path === '/logout') {
        return;
    }
    // make sure all infos are loaded since sessionStorage might
    // get cleared sporadically, especially on mobile
    systemstate.loadSystemInfo().then(function(){
        // if no REST module is installed the restinfo endpoint is not available, so fail fast
        console.log("Rest API enabled:" + systemstate.restApiEnabled());
        if (!systemstate.restApiEnabled()) {
            chrome.getNavLinkById("searchguard-configuration").hidden = true;
            return;
        }
        // rest module installed, check if user has access to the API
        systemstate.loadRestInfo().then(function(){
            console.log("Has API access:" + systemstate.hasApiAccess());
            if (systemstate.hasApiAccess()) {
                chrome.getNavLinkById("searchguard-configuration").hidden = false;
            } else {
                chrome.getNavLinkById("searchguard-configuration").hidden = true;
            }
        });
    });
}

uiModules.get('searchguard').run(enableConfiguration);

