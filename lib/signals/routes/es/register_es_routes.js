import {
  callWithRequestFactory,
  elasticsearchSignalsPlugin
} from '../../lib';
import searchEsRoute from './search';
import getIndicesRoute from './get_indices';
import getAliasesRoute from './get_aliases';
import getMappingsRoute from './get_mappings';
import { CLUSTER } from '../../../../utils/signals/constants';

export default function registerEsRoutes(server) {
  server.route(searchEsRoute(
    server,
    callWithRequestFactory,
    CLUSTER.ALERTING,
    [elasticsearchSignalsPlugin]
  ));

  server.route(getIndicesRoute(
    server,
    callWithRequestFactory,
    CLUSTER.ALERTING,
    [elasticsearchSignalsPlugin]
  ));

  server.route(getAliasesRoute(
    server,
    callWithRequestFactory,
    CLUSTER.ALERTING,
    [elasticsearchSignalsPlugin]
  ));

  server.route(getMappingsRoute(
    server,
    callWithRequestFactory,
    CLUSTER.ALERTING,
    [elasticsearchSignalsPlugin]
  ));

}
