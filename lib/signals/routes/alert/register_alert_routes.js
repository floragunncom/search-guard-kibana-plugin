import {
  callWithRequestFactory,
  elasticsearchSignalsPlugin
} from '../../lib';
import deleteAlertRoute from './delete';
import { CLUSTER } from '../../../../utils/signals/constants';

export default function registerAlertRoutes(server) {
  server.route(deleteAlertRoute(
    server,
    callWithRequestFactory,
    CLUSTER.ALERTING,
    [elasticsearchSignalsPlugin]  
  ));
}
