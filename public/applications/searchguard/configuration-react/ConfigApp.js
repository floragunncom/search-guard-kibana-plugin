/* eslint-disable @kbn/eslint/require-license-header */
import { BehaviorSubject } from 'rxjs';
import { AppNavLinkStatus } from '../../../../../../src/core/public';
import { SEARCHGUARD_APP_CATEGORY } from '../../../utils/constants';

export class ConfigApp {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.appUpdater = new BehaviorSubject(() => ({}));
  }

  mount({ core, configService, httpClient }) {
    return async (params) => {
      const [{ renderApp }] = await Promise.all([import('./npstart'), configService.fetchConfig()]);

      const isConfigEnabled =
        configService.get('searchguard.configuration.enabled') && configService.hasApiAccess();

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
      id: 'searchguard-configuration',
      title: 'Configuration',
      category: SEARCHGUARD_APP_CATEGORY,
      updater$: this.appUpdater,
      mount: this.mount({ core, configService, httpClient }),
    });

    if (plugins.home) {
      plugins.home.featureCatalogue.register({
        id: 'searchguard-configuration',
        title: 'Search Guard Configuration',
        description: 'Configure users, roles and permissions for Search Guard.',
        icon: 'securityApp',
        path: '/app/searchguard-configuration',
        showOnHomePage: true,
        category: 'data',
      });
    }
  }

  start({ configService }) {
    const isConfigEnabled =
      configService.get('searchguard.configuration.enabled') && configService.hasApiAccess();

    if (!isConfigEnabled) {
      this.appUpdater.next(() => ({
        navLinkStatus: AppNavLinkStatus.disabled,
        tooltip: 'Configuration disabled',
      }));
    }
  }
}
