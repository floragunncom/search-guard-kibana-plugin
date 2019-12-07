import {
  fetchAllFromScroll,
  callWithRequestFactory,
  elasticsearchSignalsPlugin
} from '../../lib';
import { getAlertsRoute } from './get';
import { getAlertsByQueryRoute } from './get_by_query';
import { CLUSTER } from '../../../../utils/signals/constants';

export default function registerAlertsRoutes(server) {
  server.route(getAlertsRoute(
    server,
    callWithRequestFactory,
    fetchAllFromScroll,
    CLUSTER.ALERTING,
    [elasticsearchSignalsPlugin]
  ));

  server.route(getAlertsByQueryRoute(
    server,
    callWithRequestFactory,
    fetchAllFromScroll,
    CLUSTER.ALERTING,
    [elasticsearchSignalsPlugin]
  ));

}
