/**
 *    Copyright 2018 floragunn GmbH

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


export default function PageController() {

    const ROOT = chrome.getBasePath();
    const BRANDIMAGE = chrome.getInjected("basicauth.login.brandimage");

    // if session was not terminated by logout, clear any remaining
    // stored paths etc. from previous users, to avoid issues
    // like a non-working default index pattern
    localStorage.clear();
    sessionStorage.clear();

    this.title = null;

    const queryParamString = location.search;

    if (queryParamString) {
        if (queryParamString.indexOf('type=missingTenant') > -1) {
            this.title = 'Missing Tenant';
            this.subtitle = 'No tenant available for this user, please contact your system administrator.';
        } else if (queryParamString.indexOf('type=sessionExpired') > -1) {
            this.title = 'Session Expired';
            this.subtitle = 'Please provide a new token.';
        } else if (queryParamString.indexOf('type=authError') > -1) {
            this.title = 'Authentication failed';
            this.subtitle = 'Please provide a new token.';
        }
    }

    // Default to logged out
    if (this.title == null) {
        this.title = 'Logged out';
        this.subtitle = 'Please login with a new token.'
    }


    // Custom styling
    this.showbrandimage = chrome.getInjected("basicauth.login.showbrandimage");
    this.brandimage = chrome.getInjected("basicauth.login.brandimage");



    if (BRANDIMAGE.startsWith("/plugins")) {
        this.brandimage = ROOT + BRANDIMAGE;
    } else {
        this.brandimage = BRANDIMAGE;
    }

};
