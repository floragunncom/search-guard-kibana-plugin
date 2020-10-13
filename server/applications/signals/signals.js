/* eslint-disable @kbn/eslint/require-license-header */
import { CLUSTER } from '../../../utils/signals/constants';
import { elasticsearchSignalsPlugin } from './lib/elasticsearch_signals_plugin';
import { registerRoutes } from './routes';

export class Signals {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.logger = coreContext.logger.get('signals');
  }

  setupSync({ core, kibanaRouter, searchguardBackendService }) {
    this.logger.debug('Setup app');

    try {
      this.clusterClient = core.elasticsearch.legacy.createClient(CLUSTER.ALERTING, {
        plugins: [elasticsearchSignalsPlugin],
      });

      registerRoutes({
        router: kibanaRouter,
        searchguardBackendService,
        clusterClient: this.clusterClient,
        logger: this.coreContext.logger,
      });
    } catch (error) {
      this.logger.error(error);
    }
  }
}
