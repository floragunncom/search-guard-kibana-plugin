import { callWithRequestFactory } from '../../lib/call_with_request_factory';
import searchEsRoute from './search';
import getIndicesRoute from './get_indices';
import getAliasesRoute from './get_aliases';
import getMappingsRoute from './get_mappings';

export default function registerEsRoutes(server) {
  server.route(searchEsRoute(server, callWithRequestFactory));
  server.route(getIndicesRoute(server, callWithRequestFactory));
  server.route(getAliasesRoute(server, callWithRequestFactory));
  server.route(getMappingsRoute(server, callWithRequestFactory));
}
