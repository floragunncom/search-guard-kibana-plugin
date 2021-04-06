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

import { BehaviorSubject } from 'rxjs';
import { AppNavLinkStatus } from '../../../../../src/core/public';
import { addTenantToShareURL } from './addTenantToShareURL';
import { SEARCHGUARD_APP_CATEGORY } from '../../utils/constants';

export class MultiTenancy {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.appUpdater = new BehaviorSubject(() => ({}));
  }

  mount({ configService, httpClient, chromeHelper }) {
    return async (params) => {
      const [{ renderApp }] = await Promise.all([import('./npstart'), configService.fetchConfig()]);

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
        id: 'searchguard-multitenancy',
        title: 'Multitenancy',
        category: SEARCHGUARD_APP_CATEGORY,
        updater$: this.appUpdater,
        mount: this.mount({ core, configService, httpClient, chromeHelper }),
      });

      if (plugins.home) {
        plugins.home.featureCatalogue.register({
          id: 'searchguard-multitenancy',
          title: 'Search Guard Multi Tenancy',
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

  start({ configService }) {
    try {
      if (!configService.get('searchguard.multitenancy.enabled')) {
        this.appUpdater.next(() => ({
          navLinkStatus: AppNavLinkStatus.disabled,
          tooltip: 'Multitenancy disabled',
        }));
      }
    } catch (error) {
      console.error(`Multitenancy: ${error.toString()} ${error.stack}`);
    }
  }
}
