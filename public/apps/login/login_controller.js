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

export default function LoginController($scope, $http, $window) {

    const ROOT = chrome.getBasePath();
    const APP_ROOT = `${ROOT}/searchguard`;
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

    if (BRANDIMAGE.startsWith("/plugins")) {
        this.brandimage = ROOT + BRANDIMAGE;
    } else {
        this.brandimage = BRANDIMAGE;
    }

    this.submit = () => {
        $http.post(`${API_ROOT}/login`, this.credentials)
            .then(
            (response) => {
                $window.location.href = `${ROOT}/`;
            },
            (error) => {
                if (error.status && error.status === 401) {
                    this.errorMessage = 'Invalid username or password, please try again';
                } else {
                    this.errorMessage = 'An error occurred while checking your credentials, make sure your have a running Elasticsearch cluster secured by Search Guard running.';
                }
            }
        );
    };

};
