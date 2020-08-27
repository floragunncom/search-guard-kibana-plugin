/* eslint-disable @kbn/eslint/require-license-header */
import { BehaviorSubject } from 'rxjs';
import { AppNavLinkStatus } from '../../../../../../src/core/public';
import { SEARCHGUARD_APP_CATEGORY } from '../../utils/constants';

export class AccountInfo {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.appUpdater = new BehaviorSubject(() => ({}));
  }

  mount({ configService, httpClient }) {
    return async (params) => {
      const [{ renderApp }] = await Promise.all([import('./npstart'), configService.init()]);

      if (configService.get('searchguard.accountinfo.enabled')) {
        return renderApp({
          element: params.element,
          httpClient,
          configService,
        });
      }
    };
  }

  setupSync({ core, httpClient, configService }) {
    try {
      core.application.register({
        id: 'searchguard-accountinfo',
        title: 'Account',
        category: SEARCHGUARD_APP_CATEGORY,
        updater$: this.appUpdater,
        mount: this.mount({ httpClient, configService }),
      });
    } catch (error) {
      console.error(`Accountinfo: ${error.toString()} ${error.stack} `);
    }
  }

  start({ configService }) {
    try {
      if (!configService.get('searchguard.accountinfo.enabled')) {
        this.appUpdater.next(() => ({
          navLinkStatus: AppNavLinkStatus.disabled,
          tooltip: 'Accountinfo disabled',
        }));
      }
    } catch (error) {
      console.error(`Accountinfo: ${error.toString()} ${error.stack} `);
    }
  }
}
