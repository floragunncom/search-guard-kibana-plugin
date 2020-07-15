/* eslint-disable @kbn/eslint/require-license-header */
import { addTenantToShareURL } from './addTenantToShareURL';
import { API_ROOT, SEARCHGUARD_APP_CATEGORY } from '../../utils/constants';

export class MultiTenancy {
  setup({ core, plugins, chromeHelper, configService, httpClient }) {
    core.application.register({
      id: 'searchguard-multitenancy',
      title: 'Multitenancy',
      category: SEARCHGUARD_APP_CATEGORY,
      mount: async (params) => {
        const { renderApp } = await import('./npstart');

        return renderApp({
          element: params.element,
          configService,
          httpClient,
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
    if (configService.get('rest_info.user_name')) {
      httpClient.get(`${API_ROOT}/auth/authinfo`).then(({ data }) => {
        configService.setDynamicConfig('multitenancy.current_tenant', data.user_requested_tenant);
        addTenantToShareURL(configService);
      });
    }
  }
}
