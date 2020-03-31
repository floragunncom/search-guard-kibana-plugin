/* eslint-disable @kbn/eslint/require-license-header */
import { searchEsRoute } from './search';
import { getIndicesRoute } from './get_indices';
import { getAliasesRoute } from './get_aliases';
import { getMappingsRoute } from './get_mappings';

export function registerEsRoutes({ hapiServer, clusterClient }) {
  searchEsRoute({ hapiServer, clusterClient });
  getIndicesRoute({ hapiServer, clusterClient });
  getAliasesRoute({ hapiServer, clusterClient });
  getMappingsRoute({ hapiServer, clusterClient });
}
