import { fetchAllFromScroll } from '../../lib/fetch_all_from_scroll';
import { callWithRequestFactory } from '../../lib/call_with_request_factory';
import { getAlertsRoute } from './get';
import { getAlertsByQueryRoute } from './get_by_query';

export default function registerAlertsRoutes(server) {
  server.route(getAlertsRoute(server, callWithRequestFactory, fetchAllFromScroll));
  server.route(getAlertsByQueryRoute(server, callWithRequestFactory, fetchAllFromScroll));
}
