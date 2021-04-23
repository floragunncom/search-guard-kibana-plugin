/* eslint-disable @kbn/eslint/require-license-header */
import { BehaviorSubject } from 'rxjs';
import { AppNavLinkStatus } from '../../../../../src/core/public';
import { SearchGuardService } from './services';
import { SEARCHGUARD_APP_CATEGORY } from '../../utils/constants';

export class Signals {
  constructor() {
    this.appUpdater = new BehaviorSubject(() => ({}));
    this.hasPermissions = false;
  }

  mount({ core, httpClient }) {
    return async (params) => {
      const { renderApp } = await import('./npstart');

      if (this.hasPermissions) {
        return renderApp({ element: params.element, core, httpClient });
      }
    };
  }

  setupSync({ core, httpClient }) {
    try {
      core.application.register({
        id: 'searchguard-signals',
        title: 'Signals',
        category: SEARCHGUARD_APP_CATEGORY,
        updater$: this.appUpdater,
        mount: this.mount({ core, httpClient }),
      });
    } catch (error) {
      console.error(`Signals: ${error.toString()} ${error.stack} `);
    }
  }

  async start({ httpClient, configService }) {
    try {
      if (configService.isLoginPage()) return;

      const sgService = new SearchGuardService(httpClient);
      this.hasPermissions = await sgService.hasPermissions();

      if (!this.hasPermissions) {
        this.appUpdater.next(() => ({
          navLinkStatus: AppNavLinkStatus.hidden,
          tooltip: 'Signals disabled',
        }));
      }
    } catch (error) {
      console.error(`Signals: ${error.toString()} ${error.stack} `);
    }
  }
}
