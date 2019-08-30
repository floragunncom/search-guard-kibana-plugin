import { fetchAllFromScroll } from '../../lib/fetch_all_from_scroll';
import { callWithRequestFactory } from '../../lib/call_with_request_factory';
import getWatchesRoute from './get';

export default function registerWatchesRoutes(server) {
  server.route(getWatchesRoute(server, callWithRequestFactory, fetchAllFromScroll));
}
