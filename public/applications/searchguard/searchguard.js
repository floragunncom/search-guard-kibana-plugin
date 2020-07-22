/* eslint-disable @kbn/eslint/require-license-header */
import { defaultsDeep } from 'lodash';
import { ConfigService } from '../../../utils';
import { ApiService } from '../../services';
import { redirectOnSessionTimeout } from './auth/redirectOnSessionTimeout';
import { HeaderUserMenuService } from './nav';
import { ChromeHelper } from '../../services/ChromeHelper';
import { SEARCHGUARD_APP_CATEGORY } from '../../utils/constants';

export async function instantiateConfig({ coreContext, core, apiService }) {
  let restapiinfo = {};
  let systeminfo = {};
  let kibanaConfig = {};

  try {
    restapiinfo = await apiService.loadRestInfo();
  } catch (error) {
    console.error('SearchGuard, initConfig', error);
  }

  try {
    systeminfo = await apiService.loadSystemInfo();
  } catch (error) {
    console.error('SearchGuard, initConfig', error);
  }

  try {
    kibanaConfig = await apiService.loadKibanaConfig();
  } catch (error) {
    console.error('SearchGuard, initConfig', error);
  }

  const config = { searchguard: coreContext.config.get() };

  defaultsDeep(config, {
    ...kibanaConfig,
    restapiinfo,
    systeminfo,
    is_dark_mode: core.uiSettings.get('theme:darkMode'),
  });

  console.debug('SearchGuard, initConfig, config', config);
  return new ConfigService(config);
}

export class SearchGuard {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.chromeHelper = new ChromeHelper();
    this.headerUserMenuService = new HeaderUserMenuService();
  }

  async setup({ httpClient, core, plugins }) {
    try {
      this.apiService = new ApiService(httpClient);
      this.configService = await instantiateConfig({
        core,
        apiService: this.apiService,
        coreContext: this.coreContext,
      });

      redirectOnSessionTimeout(
        this.configService.get('searchguard.auth.type'),
        core.http,
        this.configService.get('restapiinfo.user_name') === 'sg_anonymous'
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
            config: this.configService.getConfig(),
          });
        },
      });

      this.registerConfig({ core, plugins, httpClient });
      this.registerAuth({ core, httpClient });

      return {
        configService: this.configService,
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
    const isConfigEnabled =
      this.configService.get('searchguard.configuration.enabled') &&
      this.configService.hasApiAccess();

    if (isConfigEnabled) {
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
