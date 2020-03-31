/* eslint-disable @kbn/eslint/require-license-header */
import { CLUSTER } from '../../../utils/signals/constants';
import { elasticsearchSignalsPlugin } from './lib/elasticsearch_signals_plugin';
import { registerRoutes } from './routes';

export class Signals {
  setup({ core, router, hapiServer }) {
    this.clusterClient = core.elasticsearch.createClient(CLUSTER.ALERTING, {
      plugins: [elasticsearchSignalsPlugin],
    });

    registerRoutes({ router, hapiServer, clusterClient: this.clusterClient });
  }
}
