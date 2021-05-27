/*
 *    Copyright 2021 floragunn GmbH
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
import { shareButtonEventListener } from './addTenantToShareURL';
import { ChromeHelper } from '../../services';
import { MainContextProvider } from './contexts/MainContextProvider';
import { TenantsMenu } from './TenantsMenu';

export class MultiTenancy {
  start({ core, httpClient, configService } = {}) {
    const isMTEnabled = configService.get('searchguard.multitenancy.enabled');
    if (!isMTEnabled) return;

    const doAttachTenantNameToCopyShareURL =
      configService.get('searchguard.multitenancy.enabled') &&
      configService.get('authinfo.user_requested_tenant');

    if (doAttachTenantNameToCopyShareURL) shareButtonEventListener();

    const chromeHelper = new ChromeHelper();
    chromeHelper.start(core.chrome);

    core.chrome.navControls.registerLeft({
      order: 5000,
      mount: (element) => {
        ReactDOM.render(
          <MainContextProvider
            httpClient={httpClient}
            configService={configService}
            chromeHelper={chromeHelper}
            kibanaApplication={core.application}
          >
            <TenantsMenu />
          </MainContextProvider>,
          element
        );
        return () => ReactDOM.unmountComponentAtNode(element);
      },
    });
  }
}
