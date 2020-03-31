/* eslint-disable @kbn/eslint/require-license-header */
import { ackWatchRoute } from './ack';
import { createWatchRoute } from './create';
import { deleteWatchRoute } from './delete';
import { executeGraphWatchRoute } from './execute_graph';
import { executeWatchRoute } from './execute';
import { getWatchRoute } from './get';
import { stateOfWatchRoute } from './state';

export function registerWatchRoutes({ router, clusterClient }) {
  ackWatchRoute({ router, clusterClient });
  createWatchRoute({ router, clusterClient });
  deleteWatchRoute({ router, clusterClient });
  executeGraphWatchRoute({ router, clusterClient });
  executeWatchRoute({ router, clusterClient });
  getWatchRoute({ router, clusterClient });
  stateOfWatchRoute({ router, clusterClient });
}
