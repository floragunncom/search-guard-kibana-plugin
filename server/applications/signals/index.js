/* eslint-disable @kbn/eslint/require-license-header */
import { CLUSTER, PERMISSIONS_FOR_ACCESS, APP_NAME } from '../../../utils/signals/constants';
import { elasticsearchSignalsPlugin } from './lib/elasticsearch_signals_plugin';
import { registerRoutes } from './routes';

export class Signals {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.logger = coreContext.logger.get('signals');
  }

  setup({ core, router, hapiServer, searchguardBackendService }) {
    this.clusterClient = core.elasticsearch.legacy.createClient(CLUSTER.ALERTING, {
      plugins: [elasticsearchSignalsPlugin],
    });

    this.registerToLeftNavBar({ core, searchguardBackendService });
    registerRoutes({
      router,
      hapiServer,
      clusterClient: this.clusterClient,
      logger: this.coreContext.logger,
    });
  }

  registerToLeftNavBar({ core, searchguardBackendService }) {
    async function hasPermissions(headers, logger) {
      try {
        const { permissions = {} } = await searchguardBackendService.hasPermissions(
          headers,
          PERMISSIONS_FOR_ACCESS,
          searchguardBackendService
        );

        return Object.values(permissions).includes(true);
      } catch (error) {
        logger.error(error);
      }

      return false;
    }

    core.capabilities.registerSwitcher(async (request, uiCapabilities) => {
      uiCapabilities.navLinks[APP_NAME] = await hasPermissions(request.headers, this.logger);
      return uiCapabilities;
    });
  }
}
