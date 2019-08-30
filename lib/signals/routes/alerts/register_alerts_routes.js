import { fetchAllFromScroll } from '../../lib/fetch_all_from_scroll';
import { callWithRequestFactory } from '../../lib/call_with_request_factory';
import getAlertsRoute from './get';

export default function registerAlertsRoutes(server) {
  server.route(getAlertsRoute(server, callWithRequestFactory, fetchAllFromScroll));
}
