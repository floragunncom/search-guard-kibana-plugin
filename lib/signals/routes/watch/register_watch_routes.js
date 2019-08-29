import { callWithRequestFactory } from '../../lib/call_with_request_factory';
import getWatchRoute from './get';
import createWatchRoute from './create';
import deleteWatchRoute from './delete';
import executeWatchRoute from './execute';
import executeGraphWatchRoute from './execute_graph';

export default function registerWatchesRoutes(server) {
  server.route(getWatchRoute(server, callWithRequestFactory));
  server.route(createWatchRoute(server, callWithRequestFactory));
  server.route(deleteWatchRoute(server, callWithRequestFactory));
  server.route(executeWatchRoute(server, callWithRequestFactory));
  server.route(executeGraphWatchRoute(server, callWithRequestFactory));
}
