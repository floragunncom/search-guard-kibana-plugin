import {
  callWithRequestFactory,
  elasticsearchSignalsPlugin
} from '../../lib';
import getWatchRoute from './get';
import createWatchRoute from './create';
import deleteWatchRoute from './delete';
import executeWatchRoute from './execute';
import executeGraphWatchRoute from './execute_graph';
import ackWatchRoute from './ack';
import stateOfWatchRoute from './state';
import { CLUSTER } from '../../../../utils/signals/constants';

export default function registerWatchesRoutes(server) {
  server.route(getWatchRoute(
    server,
    callWithRequestFactory,
    CLUSTER.ALERTING,
    [elasticsearchSignalsPlugin]
  ));

  server.route(createWatchRoute(
    server,
    callWithRequestFactory,
    CLUSTER.ALERTING,
    [elasticsearchSignalsPlugin]
  ));

  server.route(deleteWatchRoute(
    server,
    callWithRequestFactory,
    CLUSTER.ALERTING,
    [elasticsearchSignalsPlugin]
  ));

  server.route(executeWatchRoute(
    server,
    callWithRequestFactory,
    CLUSTER.ALERTING,
    [elasticsearchSignalsPlugin]
  ));

  server.route(executeGraphWatchRoute(
    server,
    callWithRequestFactory,
    CLUSTER.ALERTING,
    [elasticsearchSignalsPlugin]
  ));

  server.route(ackWatchRoute(
    server,
    callWithRequestFactory,
    CLUSTER.ALERTING,
    [elasticsearchSignalsPlugin]
  ));

  server.route(stateOfWatchRoute(
    server,
    callWithRequestFactory,
    CLUSTER.ALERTING,
    [elasticsearchSignalsPlugin]
  ));

}
