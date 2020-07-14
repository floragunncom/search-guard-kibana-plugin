/* eslint-disable @kbn/eslint/require-license-header */
import { defaultsDeep } from 'lodash';
import { ConfigService } from '../../../utils';
import { SystemStateService } from '../../services/SystemStateService';
import { redirectOnSessionTimeout } from './auth/redirectOnSessionTimeout';
import { HeaderUserMenuService } from './nav';
import { ChromeHelper } from '../../services/ChromeHelper';
import { API_ROOT, SEARCHGUARD_APP_CATEGORY } from '../../utils/constants';

function readKibanaConfig(httpClient) {
  return httpClient.get(`${API_ROOT}/searchguard/kibana_config`).then(({ data }) => data);
}

export class SearchGuard {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.chromeHelper = new ChromeHelper();
    this.headerUserMenuService = new HeaderUserMenuService();
  }

  async setup({ httpClient, core, plugins }) {
    try {
      this.systemStateService = new SystemStateService(httpClient);

      const [restInfo] = await Promise.all([
        this.systemStateService.loadRestInfo(),
        this.systemStateService.loadSystemInfo(),
      ]);

      let config = { searchguard: this.coreContext.config.get(), rest_info: {} };

      // @todo Better check for login/customerror page
      if (restInfo.user_name) {
        const kibanaConfig = await readKibanaConfig(httpClient);

        config = defaultsDeep(config, {
          ...kibanaConfig,
          rest_info: restInfo,
          is_dark_mode: core.uiSettings.get('theme:darkMode'),
        });
      }

      this.configService = new ConfigService(config);

      redirectOnSessionTimeout(
        this.configService.get('searchguard.auth.type'),
        core.http,
        this.configService.get('rest_info.user_name') === 'sg_anonymous'
      );

      core.http.anonymousPaths.register('/customerror');
      core.application.register({
        id: 'customerror',
        title: 'SearchGuard Custom Error',
        chromeless: true,
        appRoute: '/customerror',
        mount: async ({ element }) => {
          const { renderApp } = await import('./customerror');

          return renderApp({
            element,
            basePath: core.http.basePath.get(),
            config: this.config.get(),
          });
        },
      });

      this.registerConfig({ core, plugins, httpClient });
      this.registerAuth({ core, httpClient });

      return {
        configService: this.configService,
        systemStateService: this.systemStateService,
        chromeHelper: this.chromeHelper,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  start({ core, httpClient }) {
    try {
      // Make sure the chrome helper has access to coreStart.chrome
      this.chromeHelper.start(core.chrome);

      this.headerUserMenuService.start({
        core,
        httpClient,
        // @todo Better check for login/customerror page
        config: this.configService.getConfig(),
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * Register the login app and paths based on the current auth type
   */
  registerAuth({ core, httpClient }) {
    const authType = this.configService.get('searchguard.auth.type');

    if (authType) {
      core.http.anonymousPaths.register('/login');
    }

    if (authType === 'basicauth') {
      core.application.register({
        id: 'searchguard-login',
        title: 'Login',
        chromeless: true,
        appRoute: '/login',
        euiIconType: 'user',
        mount: async (params) => {
          const { renderApp } = await import('./login/npstart');

          return renderApp({
            element: params.element,
            basePath: core.http.basePath.get(),
            config: this.configService,
            httpClient,
          });
        },
      });
    }
  }

  registerConfig({ core, plugins, httpClient }) {
    if (
      this.configService.get('searchguard.configuration.enabled') &&
      this.systemStateService.hasApiAccess()
    ) {
      core.application.register({
        id: 'searchguard-configuration',
        title: 'Configuration',
        category: SEARCHGUARD_APP_CATEGORY,
        mount: async ({ element }) => {
          const { renderApp } = await import('./configuration-react');

          return renderApp({
            element,
            core,
            httpClient,
            configService: this.configService,
          });
        },
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
  }
}
