import { fetchAllFromScroll } from '../../lib/fetch_all_from_scroll';
import { callWithRequestFactory } from '../../lib/call_with_request_factory';
import getDestinationsRoute from './get';

export default function registerDestinationsRoutes(server) {
  server.route(getDestinationsRoute(server, callWithRequestFactory, fetchAllFromScroll));
}
