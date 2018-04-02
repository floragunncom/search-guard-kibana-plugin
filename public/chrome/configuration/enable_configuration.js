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
import { FeatureCatalogueRegistryProvider, FeatureCatalogueCategory } from 'ui/registry/feature_catalogue';
require ('../../apps/configuration/systemstate/systemstate');

const app = uiModules.get('apps/searchguard/configuration');


app.factory('errorInterceptor', function ($q, $window) {

    return {
        responseError: function (response) {

            // Handles 401s, but only if we've explicitly set the redirect property on the response.
            if (response.status == 401 && response.data && response.data.redirectTo === 'login') {
                const APP_ROOT = `${chrome.getBasePath()}`;
                const path = chrome.removeBasePath($window.location.pathname);

                // Don't run on login or logout. We shouldn't have any Ajax requests here,
                // but if other plugins are active, we would get a redirect loop.
                if(path === '/login' || path === '/logout') {
                    return $q.reject(response);
                }

                let nextUrl = path + $window.location.hash + $window.location.search;

                $window.location.href = `${APP_ROOT}/login?nextUrl=${encodeURIComponent(nextUrl)}`;
            }

            // If unhandled, we just pass the error on to the next handler.
            return $q.reject(response);
        }
    };
});

/**
 * Make sure that we add the interceptor to the existing ones.
 */
app.config(function($httpProvider) {
    $httpProvider.interceptors.push('errorInterceptor');
});


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
        if (!systemstate.restApiEnabled()) {
            chrome.getNavLinkById("searchguard-configuration").hidden = true;
            return;
        }
        // rest module installed, check if user has access to the API
        systemstate.loadRestInfo().then(function(){
            if (systemstate.hasApiAccess()) {
                chrome.getNavLinkById("searchguard-configuration").hidden = false;
                FeatureCatalogueRegistryProvider.register(() => {
                    return {
                        id: 'searchguard-configuration',
                        title: 'Search Guard Configuration',
                        description: 'Configure users, roles and permissions for Search Guard.',
                        icon: '/plugins/searchguard/assets/searchguard_logo_app.svg',
                        path: '/app/searchguard-configuration',
                        showOnHomePage: true,
                        category: FeatureCatalogueCategory.ADMIN
                    };
                });
            } else {
                chrome.getNavLinkById("searchguard-configuration").hidden = true;
            }
        });
    });
}

uiModules.get('searchguard').run(enableConfiguration);
