/*
 *    Copyright 2020 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { HeaderUserMenu } from './HeaderUserMenu';

export class HeaderUserMenuApp {
  start({ core, httpClient, configService } = {}) {
    const userName = configService.get('restapiinfo.user_name');
    const authType = configService.get('searchguard.auth.type');
    const logoutUrl = configService.get('searchguard.auth.logout_url');

    const props = { httpClient, authType };

    if (logoutUrl) {
      props.logoutUrl = logoutUrl;
    }

    if (userName) {
      props.userName = userName;
      props.userNameTooltipText = userName;
    }

    core.chrome.navControls.registerRight({
      order: 5000,
      mount: (element) => {
        ReactDOM.render(<HeaderUserMenu {...props} core={core} />, element);
        return () => ReactDOM.unmountComponentAtNode(element);
      },
    });
  }
}
