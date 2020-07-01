/* eslint-disable @kbn/eslint/require-license-header */
import { sgContext, sgConfig } from './utils/sgContext';
import { HeaderUserMenuService } from './applications/nav';
import { HttpWrapper } from './utils/httpWrapper';
import { SystemStateService } from './services/SystemStateService';
import { FeatureCatalogueCategory } from '../../../src/plugins/home/public';
import { redirectOnSessionTimeout } from './auth/redirectOnSessionTimeout';
import { API_ROOT, SEARCHGUARD_APP_CATEGORY } from './utils/constants';
import { addTenantToShareURL } from './applications/multitenancy/addTenantToShareURL';
import { Signals } from './applications/signals';
import { ChromeHelper } from './services/ChromeHelper';

export class PublicPlugin {
  constructor(initializerContext) {
    this.initializerContext = initializerContext;
    this.config = this.initializerContext.config;
    this.headerUserMenuService = new HeaderUserMenuService();
    this.signalsApp = new Signals();
    this.chromeHelper = new ChromeHelper();
  }

  async setup(core, plugins) {
    // Set up context
    // @todo I believe we have to reconsider this. CoreStart is different from CoreSetup
    sgContext.kibanaCore = core;
    sgConfig.injectedValues = this.config.get();
    sgContext.pluginVersion = sgContext.config.get('sgVersion');

    this.httpClient = new HttpWrapper(core.http);
    this.systemStateService = new SystemStateService(this.httpClient);

    await this.systemStateService.loadSystemInfo();

    // @todo Maybe only load this on /app - pages?
    const restInfo = await this.systemStateService.loadRestInfo();

    // @todo Better check for login/customerror page
    if (restInfo.user_name) {
      sgContext.isDarkMode = core.uiSettings.get('theme:darkMode');
    }

    redirectOnSessionTimeout(
      sgContext.config.get('auth.type'),
      core.http,
      restInfo.user_name === 'sg_anonymous'
    );

    if (sgContext.config.get('searchguard.accountinfo.enabled')) {
      core.application.register({
        id: 'searchguard-accountinfo',
        title: 'Account',
        category: SEARCHGUARD_APP_CATEGORY,
        mount: async params => {
          const { renderApp } = await import('./applications/accountinfo/npstart');
          return renderApp({
            element: params.element,
            httpClient: this.httpClient,
            pluginVersion: sgContext.pluginVersion,
          });
        },
      });
    }

    if (
      sgContext.config.get('searchguard.configuration.enabled') &&
      this.systemStateService.hasApiAccess()
    ) {
      core.application.register({
        id: 'searchguard-configuration',
        title: 'Configuration',
        category: SEARCHGUARD_APP_CATEGORY,
        mount: async ({ element }) => {
          const { renderApp } = await import('./applications/configuration-react');

          return renderApp({ element, core, httpClient: this.httpClient });
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
          category: FeatureCatalogueCategory.ADMIN,
        });
      }
    }

    if (sgContext.config.get('searchguard.multitenancy.enabled')) {
      core.application.register({
        id: 'searchguard-multitenancy',
        title: 'Multitenancy',
        category: SEARCHGUARD_APP_CATEGORY,
        mount: async params => {
          const { renderApp } = await import('./applications/multitenancy/npstart');

          return renderApp({
            element: params.element,
            sgContext,
            httpClient: this.httpClient,
            chromeHelper: this.chromeHelper,
          });
        },
      });

      if (plugins.home) {
        plugins.home.featureCatalogue.register({
          id: 'searchguard-multitenancy',
          title: 'Search Guard Multi Tenancy',
          description: 'Separate searches, visualizations and dashboards by tenants.',
          icon: 'usersRolesApp',
          path: '/app/searchguard-multitenancy',
          showOnHomePage: true,
          category: FeatureCatalogueCategory.DATA,
        });
      }

      // Make sure we have the current tenant available
      // @todo Better check for login/customerror page
      if (restInfo.user_name) {
        this.httpClient.get(`${API_ROOT}/auth/authinfo`).then(response => {
          sgContext.multiTenancy.setTenant(response.data.user_requested_tenant);
          addTenantToShareURL();
        });
      }
    }

    this.registerAuthApps(core, sgContext.config.get('auth.type'));

    core.http.anonymousPaths.register('/customerror');
    core.application.register({
      id: 'customerror',
      title: 'SearchGuard Custom Error',
      chromeless: true,
      appRoute: '/customerror',
      mount: async ({ element }) => {
        const { renderApp } = await import('./applications/customerror');

        return renderApp({
          element,
          basePath: core.http.basePath.get(),
          config: this.config.get(),
        });
      },
    });

    this.signalsApp.setup({ core, httpClient: this.httpClient });
  }

  async start(core) {
    // Make sure the chrome helper has access to coreStart.chrome
    this.chromeHelper.start(core.chrome);
    const restInfo = await this.systemStateService.loadRestInfo();

    await this.headerUserMenuService.start({
      core,
      httpClient: this.httpClient,
      config: { ...this.config.get(), userName: restInfo.user_name },
    });
  }

  stop() {}

  /**
   * Register the login app and paths based on the current auth type
   * @param core
   * @param authType
   * @returns {Function|*}
   */
  registerAuthApps(core, authType) {
    // Register a login endpoint if we have an auth type
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
        mount: async params => {
          const { renderApp } = await import('./applications/login/npstart');

          return renderApp({
            element: params.element,
            basePath: core.http.basePath.get(),
            config: sgContext.config,
            httpClient: this.httpClient,
          });
        },
      });
    }
  }
}
