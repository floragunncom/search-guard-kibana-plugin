/* eslint-disable @kbn/eslint/require-license-header */
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
        kibanaConfig = {
          searchguard: pick(config.searchguard || {}, ['enabled', 'sgVersion']),
          elasticsearch: pick(config.elasticsearch || {}, ['username']),
          kibana: pick(config.kibana || {}, ['index']),
        };

        config.searchguard.readonly_mode = config.searchguard.readonly_mode || {};
        kibanaConfig.searchguard.readonly_mode = pick(config.searchguard.readonly_mode, ['roles']);

        config.searchguard.auth = config.searchguard.auth || {};
        kibanaConfig.searchguard.auth = pick(config.searchguard.auth, ['type']);

        // At the moment we use this to decide whether or not to display the logout button
        kibanaConfig.uiHelpers = {};

        // @todo For multiple auth types, this would be authManager instead of authInstance
        // @todo Maybe switch to another method that only checks for a cookie?
        // @todo Or uses the getAuthInstanceBy* methods
        if (context.searchGuard.authManager) {
          kibanaConfig.uiHelpers.hasAuthCookie =
            (await context.searchGuard.authManager.getAuthHeader(request)) === false ? false : true;
        }


        config.searchguard.multitenancy = config.searchguard.multitenancy || {};
        kibanaConfig.searchguard.multitenancy = {
          ...pick(config.searchguard.multitenancy, ['enable_filter', 'show_roles']),
          tenants: pick(config.searchguard.multitenancy.tenants, [
            'enable_private',
            'enable_global',
            'preferred',
          ]),
        };

        config.searchguard.accountinfo = config.searchguard.accountinfo || {};
        kibanaConfig.searchguard.accountinfo = pick(config.searchguard.accountinfo, ['enabled']);
      }

      logger.debug('Serve the Kibana config:', JSON.stringify(kibanaConfig, null, 2));

      return response.ok({ body: kibanaConfig });
    } catch (error) {
      logger.error(error);
      return response.internalError({ body: error });
    }
  };
}

export function kibanaConfigRoute({ router, config, logger }) {
  const options = {
    path: `${API_ROOT}/${'searchguard'}/kibana_config`,
    validate: false,
  };

  router.get(options, handleKibanaConfig({ config, logger }));
}
