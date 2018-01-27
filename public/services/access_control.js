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
import { uiModules } from 'ui/modules';
import 'ui/notify';

uiModules
.get('kibana')
.service('searchGuardAccessControl', function ($rootScope, $window, $http, $location, createNotifier) {
  const APP_ROOT = `${chrome.getBasePath()}`;
  const API_ROOT = `${APP_ROOT}/api/v1/auth`;

  const notify = createNotifier({
    location: 'Search Guard Access Control'
  });

  class SearchGuardControlService {

    logout() {
        $http.post(`${API_ROOT}/logout`)
        .then(
          () => {
            localStorage.clear();
            sessionStorage.clear();
            $window.location.href = `${APP_ROOT}/login`;
          },
          (error) => notify.error(error)
        );
    }
  }

  return new SearchGuardControlService();
});
