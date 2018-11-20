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
import uiRoutes from 'ui/routes';
import { uiModules } from 'ui/modules';
import { toastNotifications } from 'ui/notify';
import 'ui/autoload/styles';
import infoTemplate from './accountinfo.html';

uiRoutes.enable();

uiRoutes
    .when('/', {
        template: infoTemplate,
        controller: 'accountInfoNavController',
        controllerAs: 'ctrl'
    });

uiModules
    .get('app/searchguard-accountinfo')
    .controller('accountInfoNavController', function ($http, $window, Private, sg_resolvedInfo) {

        var APP_ROOT = `${chrome.getBasePath()}`;
        var API_ROOT = `${APP_ROOT}/api/v1`;

        $http.get(`${API_ROOT}/auth/authinfo`)
            .then(
                (response) => {

                    this.sg_user = response.data;
                },
                (error) => {
                    toastNotifications.addDanger({
                        text: error.message,
                    });
                }
            );
    });