/* eslint-disable @osd/eslint/require-license-header */
import { BehaviorSubject } from 'rxjs';
import { AppNavLinkStatus } from '../../../../../src/core/public';
import { SecurityService } from './services';
import { ELIATRASUITE_APP_CATEGORY } from '../../utils/constants';
import { appNaviFix } from '../../utils/appNaviFix';

export class Alerting {
  constructor() {
    this.appUpdater = new BehaviorSubject(() => ({}));
    this.hasPermissions = false;
  }

  mount({ core, httpClient }) {
    return async (params) => {
      if (!this.hasPermissions) return;

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
        removeExternalHistoryListener,
      });
    };
  }

  setupSync({ core, httpClient }) {
    try {
      core.application.register({
        id: 'alerting-plus',
        title: 'Alerting Plus',
        category: ELIATRASUITE_APP_CATEGORY,
        updater$: this.appUpdater,
        mount: this.mount({ core, httpClient }),
      });
    } catch (error) {
      console.error(`Alerting: ${error.toString()} ${error.stack} `);
    }
  }

  async setup({ httpClient, configService }) {
    try {
      if (configService.isLoginPage()) return;
      const sgService = new SecurityService(httpClient);
      this.hasPermissions = await sgService.hasPermissions();
    } catch (error) {
      console.error(`Alerting setup: ${error.toString()} ${error.stack} `);
    }
  }

  async start({ httpClient, configService }) {
    try {
      if (configService.isLoginPage()) return;

      const sgService = new SecurityService(httpClient);
      this.hasPermissions = await sgService.hasPermissions();

      if (!this.hasPermissions) {
        this.appUpdater.next(() => ({
          navLinkStatus: AppNavLinkStatus.hidden,
          tooltip: 'Alerting disabled',
        }));
      }
    } catch (error) {
      console.error(`Alerting start: ${error.toString()} ${error.stack} `);
    }
  }
}
