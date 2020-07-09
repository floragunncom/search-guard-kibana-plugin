/* eslint-disable @kbn/eslint/require-license-header */
import { HttpWrapper } from './utils/httpWrapper';
import { API_ROOT, SEARCHGUARD_APP_CATEGORY } from './utils/constants';
import { addTenantToShareURL } from './applications/multitenancy';
import { Signals } from './applications/signals';
import { SearchGuard } from './applications/searchguard';

export class PublicPlugin {
  constructor(initializerContext) {
    this.initializerContext = initializerContext;
    this.signalsApp = new Signals();
    this.searchGuardApp = new SearchGuard(this.initializerContext);
  }

  async setup(core, plugins) {
    this.httpClient = new HttpWrapper(core.http);

    const { configService, systemStateService, chromeHelper } = await this.searchGuardApp.setup({
      core,
      plugins,
      httpClient: this.httpClient,
    });

    this.configService = configService;
    this.systemStateService = systemStateService;

    this.signalsApp.setup({ core, httpClient: this.httpClient });

    if (this.configService.get('searchguard.accountinfo.enabled')) {
      core.application.register({
        id: 'searchguard-accountinfo',
        title: 'Account',
        category: SEARCHGUARD_APP_CATEGORY,
        mount: async (params) => {
          const { renderApp } = await import('./applications/accountinfo/npstart');
          return renderApp({
            element: params.element,
            httpClient: this.httpClient,
            pluginVersion: this.configService.get('searchguard.sgVersion'),
          });
        },
      });
    }

    if (this.configService.get('searchguard.multitenancy.enabled')) {
      core.application.register({
        id: 'searchguard-multitenancy',
        title: 'Multitenancy',
        category: SEARCHGUARD_APP_CATEGORY,
        mount: async (params) => {
          const { renderApp } = await import('./applications/multitenancy/npstart');

          return renderApp({
            element: params.element,
            configService: this.configService,
            httpClient: this.httpClient,
            chromeHelper,
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
          category: 'data',
        });
      }

      // Make sure we have the current tenant available
      // @todo Better check for login/customerror page
      if (this.configService.get('rest_info.user_name')) {
        this.httpClient.get(`${API_ROOT}/auth/authinfo`).then(({ data }) => {
          this.configService.setDynamicConfig(
            'multitenancy.current_tenant',
            data.user_requested_tenant
          );
          addTenantToShareURL(this.configService);
        });
      }
    }
  }

  async start(core) {
    this.searchGuardApp.start({ core, httpClient: this.httpClient });
  }

  stop() {}
}
