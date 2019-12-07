import {
  callWithRequestFactory,
  fetchAllFromScroll,
  elasticsearchSignalsPlugin
} from '../../lib';
import getWatchesRoute from './get';
import { CLUSTER } from '../../../../utils/signals/constants';

export default function registerWatchesRoutes(server) {
  server.route(getWatchesRoute(
    server,
    callWithRequestFactory,
    fetchAllFromScroll,
    CLUSTER.ALERTING,
    [elasticsearchSignalsPlugin]
  ));
}
