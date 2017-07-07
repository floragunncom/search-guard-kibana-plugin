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

import { uiModules } from 'ui/modules';

uiModules
.get('kibana')
.directive('searchGuardLogoutButton', function (searchGuardAccessControl) {
  return {
    template: require('plugins/searchguard/chrome/logout_button.html'),
    replace: true,
    restrict: 'E',
    link: ($scope) => {
      $scope.logout = () => searchGuardAccessControl.logout();
    }
  };
});
