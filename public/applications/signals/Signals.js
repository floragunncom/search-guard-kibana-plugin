/* eslint-disable @kbn/eslint/require-license-header */
import { BehaviorSubject } from 'rxjs';
import { SearchGuardService } from './services';
import { getSearchGuardAppCategory } from '../../utils/constants';
import { appNaviFix } from '../../utils/appNaviFix';

const defaultPermissions = {
  signals: false,
  tenantAccounts: {
    read: false,
    manage: false,
  },
};

export class Signals {
  constructor() {
    this.appUpdater = new BehaviorSubject(() => ({}));
    this.permissions = defaultPermissions;
  }

  mount({ core, httpClient, configService }) {
    return async (params) => {
      if (!this.permissions.signals) return;

      // If the navigation came from "outside", e.g. from the
      // side nav, we need to tell our router to render the
      // corresponding page.
      // If not, the URL will change, but the page content will not.
      const removeExternalHistoryListener = appNaviFix(params.history);

      const { renderApp } = await import('./npstart');
      return renderApp({
        element: params.element,
        core,
        httpClient,
        configService,
        permissions: this.permissions,
        removeExternalHistoryListener,
        theme$: params.theme$,
      });
    };
  }

  setupSync({ core, httpClient, configService }) {
    try {
      core.application.register({
        id: 'searchguard-signals',
        title: 'Signals',
        category: getSearchGuardAppCategory(configService),
        updater$: this.appUpdater,
        mount: this.mount({ core, httpClient, configService }),
      });
    } catch (error) {
      console.error(`Signals: ${error.toString()} ${error.stack} `);
    }
  }

  async setup({ httpClient, configService }) {
    try {
      if (configService.isLoginPage()) return;
      const sgService = new SearchGuardService(httpClient);
      this.permissions = await sgService.hasPermissions();
    } catch (error) {
      console.error(`Signals setup: ${error.toString()} ${error.stack} `);
    }
  }

  async start({ httpClient, configService }) {
    try {
      if (configService.isLoginPage()) return;

      const sgService = new SearchGuardService(httpClient);
      this.permissions = await sgService.hasPermissions();

      if (!this.permissions.signals) {
        this.appUpdater.next(() => ({
          visibleIn: [],
          tooltip: 'Signals disabled',
        }));
      }
    } catch (error) {
      console.error(`Signals start: ${error.toString()} ${error.stack} `);
    }
  }
}
