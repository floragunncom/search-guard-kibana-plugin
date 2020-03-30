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

import React from 'react';
import ReactDOM from 'react-dom';
import chrome from 'ui/chrome';
import { get } from 'lodash';
import { chromeHeaderNavControlsRegistry } from 'ui/registry/chrome_header_nav_controls';
import { logoutText } from './utils/i18n';
import { HeaderUserMenu } from './header_user_menu';

const authType = chrome.getInjected('auth.type');

if (authType !== 'kerberos' && authType !== 'proxy') {
  chromeHeaderNavControlsRegistry.register($http => {
    return {
      name: 'btn-logout',
      order: 1000,
      side: 'right',
      render(el) {
        const logoutUrl = chrome.getInjected('auth.logout_url');

        let userName = '';
        const user = get(chrome.getInjected(), 'sgDynamic.user');
        if (user && !user.isAnonymousAuth) {
          userName = user.username;
        }

        const props = { httpClient: $http };

        if (logoutUrl) {
          props.logoutUrl = logoutUrl;
        }

        if (userName) {
          props.userName = userName.slice(0, 20);
          props.userNameTooltipText = (
            <>
              {logoutText} {userName}
            </>
          );
        }

        ReactDOM.render(<HeaderUserMenu {...props} />, el);
        return () => ReactDOM.unmountComponentAtNode(el);
      },
    };
  });
}
