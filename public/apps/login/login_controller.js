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

require ('../../directives/licensewarning');
require ('../configuration/systemstate/systemstate');

export default function LoginController(kbnUrl, $scope, $http, $window, systemstate) {

    const ROOT = chrome.getBasePath();
    const APP_ROOT = `${ROOT}`;
    const API_ROOT = `${APP_ROOT}/api/v1`;
    const BRANDIMAGE = chrome.getInjected("basicauth.login.brandimage");

    // if session was not terminated by logout, clear any remaining
    // stored paths etc. from previous users, to avoid issues
    // like a non-working default index pattern
    localStorage.clear();
    sessionStorage.clear();

    // Custom styling
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

    this.submit =  () => {

        try {
            $http.post(`${API_ROOT}/auth/login`, this.credentials)
                .then(
                (response) => {
                    // cache the current user information, we need it at several places
                    sessionStorage.setItem("sg_user", JSON.stringify(response.data));
                    // load and cache systeminfo and rest api info
                    // perform in the callback due to Chrome cancelling the
                    // promises if we navigate away from the page, even if async/await
                    systemstate.loadSystemInfo().then((response) => {
                        systemstate.loadRestInfo().then((response) => {
                            var user = JSON.parse(sessionStorage.getItem("sg_user"));
                            $window.location.href = `${nextUrl}`;
                        });
                    });
                },
                (error) => {
                    if (error.status && error.status === 401) {
                        this.errorMessage = 'Invalid username or password, please try again';
                    } else if (error.status && error.status === 404) {
                        // This happens either when the user doesn't have any valid tenants or roles
                        this.errorMessage = error.data.message;
                    } else {
                        this.errorMessage = 'An error occurred while checking your credentials, make sure you have an Elasticsearch cluster secured by Search Guard running.';
                    }
                }
            );
        } catch(error) {
            this.errorMessage = 'An internal error has occured.';
        }


    };

};
