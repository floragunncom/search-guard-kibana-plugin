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

import { AppNavLinkStatus } from '../../../../../src/core/public';
import { addTenantToShareURL } from './addTenantToShareURL';
import { SEARCHGUARD_APP_CATEGORY } from '../../utils/constants';
import {
  SEARCHGUARD_MULTITENANCY_APP_ID,
  SEARCHGUARD_MULTITENANCY_APP_TITLE,
} from './utils/constants';

export class MultiTenancy {
  constructor(coreContext) {
    this.coreContext = coreContext;
  }

  mount({ configService, httpClient, chromeHelper }) {
    return async (params) => {
      const [{ renderApp }] = await Promise.all([import('./npstart'), configService.init()]);

      if (configService.get('searchguard.multitenancy.enabled')) {
        return renderApp({
          element: params.element,
          configService,
          httpClient,
          chromeHelper,
        });
      }
    };
  }

  setupSync({ core, plugins, httpClient, configService, chromeHelper }) {
    try {
      core.application.register({
        id: SEARCHGUARD_MULTITENANCY_APP_ID,
        title: SEARCHGUARD_MULTITENANCY_APP_TITLE,
        category: SEARCHGUARD_APP_CATEGORY,
        mount: this.mount({ core, configService, httpClient, chromeHelper }),
        // We show the app in the Kinana header user menu
        navLinkStatus: AppNavLinkStatus.hidden,
      });

      if (plugins.home) {
        plugins.home.featureCatalogue.register({
          id: SEARCHGUARD_MULTITENANCY_APP_ID,
          title: SEARCHGUARD_MULTITENANCY_APP_TITLE,
          description: 'Separate searches, visualizations and dashboards by tenants.',
          icon: 'usersRolesApp',
          path: '/app/searchguard-multitenancy',
          showOnHomePage: true,
          category: 'data',
        });
      }

      this.setup({ configService });
    } catch (error) {
      console.error(`Multitenancy: ${error.toString()} ${error.stack}`);
    }
  }

  async setup({ configService }) {
    try {
      await configService.init();

      // @todo Better check for login/customerror page
      const doAttachTenantNameToDashboardShareURL =
        configService.get('searchguard.multitenancy.enabled') &&
        configService.get('authinfo.user_requested_tenant');

      if (doAttachTenantNameToDashboardShareURL) {
        addTenantToShareURL();
      }
    } catch (error) {
      console.error(`Multitenancy: ${error.toString()} ${error.stack}`);
    }
  }
}
