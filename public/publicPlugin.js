/* eslint-disable @kbn/eslint/require-license-header */
import { sgContext, sgConfig } from './utils/sgContext';
import { HeaderUserMenuService } from './applications/nav';
import { HttpWrapper } from './utils/httpWrapper';
import { SystemStateService } from './services/SystemStateService';
import { FeatureCatalogueCategory } from '../../../src/plugins/home/public/services/feature_catalogue';
import { redirectOnSessionTimeout } from './auth/redirectOnSessionTimeout';
import { API_ROOT } from './utils/constants';
import { addTenantToShareURL } from './applications/multitenancy/addTenantToShareURL';
import { Signals } from './applications/signals';

export class PublicPlugin {
  constructor(initializerContext) {
    this.initializerContext = initializerContext;
    this.config = this.initializerContext.config;
    this.headerUserMenuService = new HeaderUserMenuService();
    this.signalsApp = new Signals();
  }

  async setup(core, plugins) {
    // Set up context
    // @todo I believe we have to reconsider this. CoreStart is different from CoreSetup
    sgContext.kibanaCore = core;
    sgConfig.injectedValues = this.config.get();

    this.httpClient = new HttpWrapper(core.http);
    this.systemStateService = new SystemStateService(this.httpClient);

    await this.systemStateService.loadSystemInfo();
    const restInfo = await this.systemStateService.loadRestInfo();

    redirectOnSessionTimeout(
      sgContext.config.get('auth.type'),
      core.http,
      restInfo.user_name === 'sg_anonymous'
    );

    core.application.register({
      id: 'searchguard-accountinfo',
      title: 'todo',
      euiIconType: 'user',
      async mount(params) {
        const { renderApp } = await import('./applications/accountinfo/npstart');

        return renderApp(core, null, params, 'Account');
      },
    });

    if (
      sgContext.config.get('searchguard.configuration.enabled') &&
      this.systemStateService.hasApiAccess()
    ) {
      core.application.register({
        id: 'searchguard-configuration',
        title: 'Search Guard Configuration',
        icon: 'plugins/searchguard/assets/searchguard_logo_left_navbar.svg',
        mount: async ({ element }) => {
          const { renderApp } = await import('./applications/configuration-react');

          return renderApp({ element, httpClient: this.httpClient });
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
        icon: 'plugins/searchguard/assets/networking.svg',
        //euiIconType: 'user',
        mount: async params => {
          const { renderApp } = await import('./applications/multitenancy/npstart');

          return renderApp(core, null, params, this.config);
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
        async mount(params) {
          const { renderApp } = await import('./applications/login/npstart');

          return renderApp(core, null, params, 'Login');
        },
      });
    }
  }
}
