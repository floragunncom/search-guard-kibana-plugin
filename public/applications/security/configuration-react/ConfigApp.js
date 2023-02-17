/* eslint-disable @osd/eslint/require-license-header */
import { BehaviorSubject } from 'rxjs';
import { AppNavLinkStatus } from '../../../../../../src/core/public';
import { ELIATRASUITE_APP_CATEGORY } from '../../../utils/constants';
import { buildEliatraSecurityConfiguration } from './utils/helpers';

export class ConfigApp {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.appUpdater = new BehaviorSubject(() => ({}));
  }

  mount({ core, configService, httpClient }) {
    return async (params) => {
      const [{ renderApp }] = await Promise.all([import('./npstart'), configService.fetchConfig()]);

      configService.set(
        'eliatra.security.configuration',
        buildEliatraSecurityConfiguration({
          restapiinfo: configService.get('restapiinfo', {}),
          eliatra: configService.get('eliatra', {}),
        })
      );

      const isConfigEnabled =
        configService.get('eliatra.security.configuration.enabled') && configService.hasApiAccess();

      if (isConfigEnabled) {
        return renderApp({
          element: params.element,
          core,
          httpClient,
          configService,
        });
      }
    };
  }

  setupSync({ core, plugins, httpClient, configService }) {
    core.application.register({
      id: 'security-plus-configuration',
      title: 'Security Plus Configuration',
      category: ELIATRASUITE_APP_CATEGORY,
      updater$: this.appUpdater,
      mount: this.mount({ core, configService, httpClient }),
    });

    if (plugins.home) {
      plugins.home.featureCatalogue.register({
        id: 'security-configuration',
        title: 'Security Configuration',
        description: 'Configure users, roles and permissions for Eliatra Suite Security Plus.',
        icon: 'securityApp',
        path: '/app/security-configuration',
        showOnHomePage: true,
        category: 'data',
      });
    }
  }

  start({ configService }) {
    if (configService.isLoginPage()) return;

    const isConfigEnabled =
      configService.get('eliatra.security.configuration.enabled') && configService.hasApiAccess();

    if (!isConfigEnabled) {
      this.appUpdater.next(() => ({
        navLinkStatus: AppNavLinkStatus.hidden,
        tooltip: 'Configuration disabled',
      }));
    }
  }
}
