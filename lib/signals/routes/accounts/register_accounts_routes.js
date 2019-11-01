import { fetchAllFromScroll } from '../../lib/fetch_all_from_scroll';
import { callWithRequestFactory } from '../../lib/call_with_request_factory';
import getAccountsRoute from './get';

export default function registerAccountsRoutes(server) {
  server.route(getAccountsRoute(server, callWithRequestFactory, fetchAllFromScroll));
}
