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
import { chromeHeaderNavControlsRegistry } from 'ui/registry/chrome_header_nav_controls';
import { EuiButtonEmpty, EuiToolTip } from '@elastic/eui';
import { logoutText, loginText } from '../../apps/configuration-react/utils/i18n/common';
import { AccessControlService } from '../../services';

if (chrome.getInjected('auth.type') !== 'kerberos' && chrome.getInjected('auth.type') !== 'proxy') {
  chromeHeaderNavControlsRegistry.register($http => {
    const accessControl = new AccessControlService($http);

    return {
      name: 'btn-logout',
      order: 1000,
      side: 'right',
      render(el) {
        function onClick() {
          accessControl.logout();
        }

        const chromeInjected = chrome.getInjected();
        let logoutButtonLabel = logoutText;
        let logoutTooltip = logoutText;
        if (chromeInjected && chromeInjected.sgDynamic && chromeInjected.sgDynamic.user) {
          if (!chromeInjected.sgDynamic.user.isAnonymousAuth) {
            logoutButtonLabel = chromeInjected.sgDynamic.user.username;
            logoutTooltip = `Logout ${chromeInjected.sgDynamic.user.username}`;
          } else {
            logoutButtonLabel = loginText;
            logoutTooltip = loginText;
          }
        }

        ReactDOM.render(
          <EuiToolTip
            position="bottom"
            content={logoutTooltip}
          >
            <EuiButtonEmpty
              style={{ paddingTop: '8px' }}
              onClick={onClick}
              iconType="exit"
            >
              {logoutButtonLabel}
            </EuiButtonEmpty>
          </EuiToolTip>,
          el
        );

        return () => ReactDOM.unmountComponentAtNode(el);
      },
    };
  });
}
