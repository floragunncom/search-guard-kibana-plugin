import {
  fetchAllFromScroll,
  callWithRequestFactory,
  elasticsearchSignalsPlugin
} from '../../lib';
import getAccountsRoute from './get';
import { CLUSTER } from '../../../../utils/signals/constants';

export default function registerAccountsRoutes(server) {
  server.route(getAccountsRoute(
    server,
    callWithRequestFactory,
    fetchAllFromScroll,
    CLUSTER.ALERTING,
    [elasticsearchSignalsPlugin]    
  ));
}
