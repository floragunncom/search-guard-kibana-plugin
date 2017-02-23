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
import uiRoutes from 'ui/routes';
import uiModules from 'ui/modules';
import 'ui/autoload/styles';
import 'plugins/searchguard/apps/multitenancy/multitenancy.less';

import tenantTemplate from './multitenancy.html';

uiRoutes.enable();

uiRoutes
    .when('/', {
     template: tenantTemplate,
     controller: 'searchguardMultitenancyController',
     controllerAs: 'ctrl'
    });

uiModules
    .get('app/searchguard-multitenancy')
    .controller('searchguardMultitenancyController', function ($http) {

     var APP_ROOT = `${chrome.getBasePath()}/searchguard`;
     var API_ROOT = `${APP_ROOT}/api/v1`;

     this.GLOBAL_USER_LABEL = "Global";
     this.GLOBAL_USER_VALUE = null;

     $http.get(`${API_ROOT}/auth/authinfo`)
         .then(
         (response) => {
          this.tenants = response.data.sg_tenants;
         },
         (error) => notify.error(error)
     );

     $http.get(`${API_ROOT}/tenant`)
         .then(
         (response) => {
          this.tenantLabel =  response.payload;
         },
         (error) => notify.error(error)
     );

     this.selectTenant = function (tenantLabel, tenant) {
      this.tenantLabel =  tenantLabel;
      $http.post(`${API_ROOT}/tenant`, {tenant: tenant});
     };

    });
