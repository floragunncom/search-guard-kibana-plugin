/* eslint-disable @kbn/eslint/require-license-header */
import { BehaviorSubject } from 'rxjs';
import {getSearchGuardAppCategory} from '../../../utils/constants';
import { buildSeardGuardConfiguration } from './utils/helpers';
import { appNaviFix } from '../../../utils/appNaviFix';

export class ConfigApp {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.appUpdater = new BehaviorSubject(() => ({}));
  }

  mount({ core, configService, httpClient }) {
    return async (params) => {

      // If the navigation came from "outside", e.g. from the
      // tenants menu or the side nav, we need to tell our
      // router to render the corresponding page.
      // If not, the URL will change, but the page content will not.
      const removeExternalHistoryListener = appNaviFix(params.history);

      const [{ renderApp }] = await Promise.all([import('./npstart'), configService.fetchConfig()]);

      configService.set(
        'searchguard.configuration',
        buildSeardGuardConfiguration({
          restapiinfo: configService.get('restapiinfo', {}),
          searchguard: configService.get('searchguard', {}),
        })
      );

      const isConfigEnabled =
        configService.get('searchguard.configuration.enabled') && configService.hasApiAccess();

      if (isConfigEnabled) {
        return renderApp({
          element: params.element,
          core,
          httpClient,
          configService,
          removeExternalHistoryListener,
          theme$: params.theme$,
        });
      }
    };
  }

  setupSync({ core, plugins, httpClient, configService }) {
    core.application.register({
      id: 'searchguard-configuration',
      title: 'Configuration',
      category: getSearchGuardAppCategory(configService),
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
    if (configService.isLoginPage()) return;

    const isConfigEnabled =
      configService.get('searchguard.configuration.enabled') && configService.hasApiAccess();

    if (!isConfigEnabled) {
      this.appUpdater.next(() => ({
        visibleIn: [],
        tooltip: 'Configuration disabled',
      }));
    }
  }
}
