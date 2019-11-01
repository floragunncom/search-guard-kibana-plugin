import { callWithRequestFactory } from '../../lib/call_with_request_factory';
import getAccountRoute from './get';
import createAccountRoute from './create';
import deleteAccountRoute from './delete';

export default function registerAccountsRoutes(server) {
  server.route(getAccountRoute(server, callWithRequestFactory));
  server.route(createAccountRoute(server, callWithRequestFactory));
  server.route(deleteAccountRoute(server, callWithRequestFactory));
}
