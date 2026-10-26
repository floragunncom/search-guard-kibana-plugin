// @ts-check
/* eslint-disable @kbn/eslint/require-license-header */
import { BehaviorSubject } from 'rxjs';

export class LoginApp {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.appUpdater = new BehaviorSubject(() => ({}));
  }

  mount({ configService, httpClient }) {
    return async (params) => {
      const [{ renderApp }] = await Promise.all([import('./npstart'), configService.fetchConfig()]);

      const authType = configService.get('searchguard.auth.type');
      if (authType !== 'kerberos' && authType !== 'proxy') {
        return renderApp({
          element: params.element,
          config: configService,
          httpClient,
          theme$: params.theme$
        });
      }
    };
  }

  /** @param {{ core: import('@kbn/core/public').CoreSetup, httpClient: any, configService: any }} deps */
  setupSync({ core, httpClient, configService }) {
    core.http.anonymousPaths.register('/searchguard/login');

    core.application.register({
      id: 'searchguard-login',
      title: 'Login',
      chromeless: true,
      appRoute: '/searchguard/login',
      euiIconType: 'user',
      updater$: this.appUpdater,
      mount: this.mount({ configService, httpClient }),
    });
  }

  start({ configService }) {}
}
