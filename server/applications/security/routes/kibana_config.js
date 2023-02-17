/* eslint-disable @osd/eslint/require-license-header */
import { pick } from 'lodash';
import { API_ROOT } from '../../../utils/constants';

export function handleKibanaConfig({ config, logger }) {
  return async function (context, request, response) {
    try {
      let kibanaConfig = {};

      // ATTENTION! We must be careful to not expose sensitive config to UI,
      // e.g. elasticsearch password, cookie password, TLS certificates, headers, etc.
      // That is why we explicitly serve only a portion of the config.
      if (typeof config === 'object' && config !== null) {

        if (!config.eliatra) {
          config.eliatra = {};
        }

        kibanaConfig = {
          eliatra: {
            security: pick(config.eliatra.security || {}, ['enabled', 'spVersion']),
          },
          opensearch: pick(config.opensearch || {}, ['username']),
          opensearchDashboards: pick(config.opensearchDashboards || {}, ['index']),
        };

        config.eliatra.security.readonly_mode = config.eliatra.security.readonly_mode || {};
        kibanaConfig.eliatra.security.readonly_mode = pick(config.eliatra.security.readonly_mode, ['roles']);

        config.eliatra.security.auth = config.eliatra.security.auth || {};
        kibanaConfig.eliatra.security.auth = pick(config.eliatra.security.auth, ['type']);

        // @todo We probably don't need this pattern of setting an empty object as default.
        // It should always be there...
        config.eliatra.security.configuration = config.eliatra.security.configuration || {};
        kibanaConfig.eliatra.security.configuration = config.eliatra.security.configuration;

        // At the moment we use this to decide whether to display the logout button
        kibanaConfig.uiHelpers = {};
        if (context.eliatra.security && context.eliatra.security.authManager) {
          kibanaConfig.uiHelpers.hasAuthCookie =
            (await context.eliatra.security.authManager.getAuthHeader(request)) === false ? false : true;
        }


        config.eliatra.security.multitenancy = config.eliatra.security.multitenancy || {};
        kibanaConfig.eliatra.security.multitenancy = {
          ...pick(config.eliatra.security.multitenancy, ['enabled', 'enable_filter', 'show_roles']),
          tenants: pick(config.eliatra.security.multitenancy.tenants, [
            'enable_private',
            'enable_global',
            'preferred',
          ]),
        };

        config.eliatra.security.accountinfo = config.eliatra.security.accountinfo || {};
        kibanaConfig.eliatra.security.accountinfo = pick(config.eliatra.security.accountinfo, ['enabled']);
      }

      logger.debug('Serve the Dashboards config:', JSON.stringify(kibanaConfig, null, 2));

      return response.ok({ body: kibanaConfig });
    } catch (error) {
      logger.error(error);
      return response.internalError({ body: error });
    }
  };
}

export function kibanaConfigRoute({ router, config, logger }) {
  const options = {
    path: `${API_ROOT}/${'eliatrasuite'}/kibana_config`,
    validate: false,
  };

  router.get(options, handleKibanaConfig({ config, logger }));
}
