import {
  callWithRequestFactory,
  elasticsearchSignalsPlugin
} from '../../lib';
import getAccountRoute from './get';
import createAccountRoute from './create';
import deleteAccountRoute from './delete';
import { CLUSTER } from '../../../../utils/signals/constants';

export default function registerAccountsRoutes(server) {
  server.route(getAccountRoute(
    server,
    callWithRequestFactory,
    CLUSTER.ALERTING,
    [elasticsearchSignalsPlugin]
  ));

  server.route(createAccountRoute(
    server,
    callWithRequestFactory,
    CLUSTER.ALERTING,
    [elasticsearchSignalsPlugin]
  ));

  server.route(deleteAccountRoute(
    server,
    callWithRequestFactory,
    CLUSTER.ALERTING,
    [elasticsearchSignalsPlugin]
  ));
}
