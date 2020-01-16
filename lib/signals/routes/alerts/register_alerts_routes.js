import {
  fetchAllFromScroll,
  callWithRequestFactory,
  elasticsearchSignalsPlugin
} from '../../lib';
import { getAlertsRoute } from './get';
import { CLUSTER } from '../../../../utils/signals/constants';

export default function registerAlertsRoutes(server) {
  server.route(getAlertsRoute(
    server,
    callWithRequestFactory,
    fetchAllFromScroll,
    CLUSTER.ALERTING,
    [elasticsearchSignalsPlugin]
  ));
}
