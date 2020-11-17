/* eslint-disable @kbn/eslint/require-license-header */
import { searchEsRoute } from './search';
import { getIndicesRoute } from './get_indices';
import { getAliasesRoute } from './get_aliases';
import { getMappingsRoute } from './get_mappings';

export function registerEsRoutes({ router, clusterClient, logger }) {
  searchEsRoute({ router, clusterClient, logger });
  getIndicesRoute({ router, clusterClient, logger });
  getAliasesRoute({ router, clusterClient, logger });
  getMappingsRoute({ router, clusterClient, logger });
}
