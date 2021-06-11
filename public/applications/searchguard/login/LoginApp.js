/* eslint-disable @kbn/eslint/require-license-header */
import { BehaviorSubject } from 'rxjs';
import { AppNavLinkStatus } from '../../../../../../src/core/public';

export class LoginApp {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.appUpdater = new BehaviorSubject(() => ({}));
  }

  mount({ configService, httpClient }) {
    return async (params) => {
      const [{ renderApp }] = await Promise.all([import('./npstart'), configService.fetchConfig()]);

      //const authType = configService.get('searchguard.auth.type');
      // @todo Remove basicauth condition. Proxy + Kerberos?
      //if (authType === 'basicauth') {
      return renderApp({
        element: params.element,
        config: configService,
        httpClient,
      });
      //}
    };
  }

  setupSync({ core, httpClient, configService }) {
    core.http.anonymousPaths.register('/login');

    core.application.register({
      id: 'searchguard-login',
      title: 'Login',
      chromeless: true,
      appRoute: '/login',
      euiIconType: 'user',
      updater$: this.appUpdater,
      mount: this.mount({ core, configService, httpClient }),
    });
  }

  start({ configService }) {
    const authType = configService.get('searchguard.auth.type');

    if (authType !== 'basicauth') {
      this.appUpdater.next(() => ({
        navLinkStatus: AppNavLinkStatus.disabled,
        tooltip: 'Login disabled',
      }));
    }
  }
}
