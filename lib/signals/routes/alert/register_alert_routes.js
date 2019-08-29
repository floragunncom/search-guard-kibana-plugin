import { callWithRequestFactory } from '../../lib/call_with_request_factory';
import deleteAlertRoute from './delete';

export default function registerAlertRoutes(server) {
  server.route(deleteAlertRoute(server, callWithRequestFactory));
}
