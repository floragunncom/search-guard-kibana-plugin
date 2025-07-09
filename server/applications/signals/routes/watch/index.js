/* eslint-disable @kbn/eslint/require-license-header */
import { ackWatchRoute, unAckWatchRoute } from './ack';
import { createWatchRoute } from './create';
import { deleteWatchRoute } from './delete';
import { executeGraphWatchRoute } from './execute_graph';
import { executeWatchRoute } from './execute';
import { getWatchRoute } from './get';
import { stateOfWatchRoute } from './state';
import { summaryRoute } from "./summary";

export function registerWatchRoutes({ router, clusterClient, logger }) {
  ackWatchRoute({ router, clusterClient, logger });
  unAckWatchRoute({ router, clusterClient, logger });
  createWatchRoute({ router, clusterClient, logger });
  deleteWatchRoute({ router, clusterClient, logger });
  executeGraphWatchRoute({ router, clusterClient, logger });
  executeWatchRoute({ router, clusterClient, logger });
  getWatchRoute({ router, clusterClient, logger });
  stateOfWatchRoute({ router, clusterClient, logger });
  summaryRoute({ router, clusterClient, logger });

}
