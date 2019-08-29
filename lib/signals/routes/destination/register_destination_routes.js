import { callWithRequestFactory } from '../../lib/call_with_request_factory';
import getDestinationRoute from './get';
import createDestinationRoute from './create';
import deleteDestinationRoute from './delete';

export default function registerDestinationsRoutes(server) {
  server.route(getDestinationRoute(server, callWithRequestFactory));
  server.route(createDestinationRoute(server, callWithRequestFactory));
  server.route(deleteDestinationRoute(server, callWithRequestFactory));
}
