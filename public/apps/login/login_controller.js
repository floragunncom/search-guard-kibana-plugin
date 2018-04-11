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

import chrome from 'ui/chrome';
import {parse} from 'url';
import _ from 'lodash';
import {getNextUrl} from './get_next_url';

export default function LoginController(kbnUrl, $scope, $http, $window) {

    const ROOT = chrome.getBasePath();
    const APP_ROOT = `${ROOT}`;
    const API_ROOT = `${APP_ROOT}/api/v1/auth`;
    const BRANDIMAGE = chrome.getInjected("basicauth.login.brandimage");

    // if session was not terminated by logout, clear any remaining
    // stored paths etc. from previous users, to avoid issues
    // like a non-working default index pattern
    localStorage.clear();
    sessionStorage.clear();

    this.errorMessage = false;
    this.logintitle = chrome.getInjected("basicauth.login.title");
    this.loginsubtitle = chrome.getInjected("basicauth.login.subtitle");
    this.showbrandimage = chrome.getInjected("basicauth.login.showbrandimage");
    this.brandimage = chrome.getInjected("basicauth.login.brandimage");
    this.buttonstyle = chrome.getInjected("basicauth.login.buttonstyle");

    if (BRANDIMAGE.startsWith("/plugins")) {
        this.brandimage = ROOT + BRANDIMAGE;
    } else {
        this.brandimage = BRANDIMAGE;
    }

    // honor last request URL
    let nextUrl = getNextUrl($window.location.href, ROOT);

    this.submit = () => {
        $http.post(`${API_ROOT}/login`, this.credentials)
            .then(
            (response) => {
                // validate the tenant settings if multi tenancy is enabled

                // if MT is disabled, or the GLOBAL tenant is enabled,
                // no further checks are necessary. In the first case MT does not
                // matter, in the latter case we always have a tenant as fallback if
                // user has no tenants configured and PRIVATE is disabled
                if (!chrome.getInjected("multitenancy.enabled") || chrome.getInjected("multitenancy.tenants.enable_global")) {
                    $window.location.href = `${nextUrl}`;
                } else {
                    // GLOBAL is disabled, check if we have at least one tenant to choose from
                    var allTenants = response.data.tenants;
                    // if private tenant is disabled, remove it
                    if(allTenants != null && !chrome.getInjected("multitenancy.tenants.enable_private")) {
                        delete allTenants[response.data.username];
                    }
                    // check that we have at least one tenant to fall back to
                    if (allTenants == null || allTenants.length == 0 || _.isEmpty(allTenants)) {
                        this.errorMessage = 'No tenant available for this user, please contact your system administrator.';
                    } else {
                        $window.location.href = `${nextUrl}`;
                    }
                }

            },
            (error) => {
                if (error.status && error.status === 401) {
                    this.errorMessage = 'Invalid username or password, please try again';
                } else {
                    this.errorMessage = 'An error occurred while checking your credentials, make sure your have an  Elasticsearch cluster secured by Search Guard running.';
                }
            }
        );
    };
};
