/* eslint-disable @kbn/eslint/require-license-header */
import { CLUSTER, PERMISSIONS_FOR_ACCESS, APP_NAME } from '../../../utils/signals/constants';
import { elasticsearchSignalsPlugin } from './lib/elasticsearch_signals_plugin';
import { registerRoutes } from './routes';

export class Signals {
  setup({ core, router, hapiServer, searchguardBackendService }) {
    this.clusterClient = core.elasticsearch.createClient(CLUSTER.ALERTING, {
      plugins: [elasticsearchSignalsPlugin],
    });

    this.registerToLeftNavBar({ core, searchguardBackendService });
    registerRoutes({ router, hapiServer, clusterClient: this.clusterClient });
  }

  registerToLeftNavBar({ core, searchguardBackendService }) {
    async function hasPermissions(headers) {
      try {
        const { permissions = {} } = await searchguardBackendService.hasPermissions(
          headers,
          PERMISSIONS_FOR_ACCESS,
          searchguardBackendService
        );

        return Object.values(permissions).includes(true);
      } catch (error) {
        console.error('Signals - registerToLeftNavBar - hasPermissions', error);
      }

      return false;
    }

    core.capabilities.registerSwitcher(async (request, uiCapabilities) => {
      uiCapabilities.navLinks[APP_NAME] = await hasPermissions(request.headers);
      return uiCapabilities;
    });
  }
}
