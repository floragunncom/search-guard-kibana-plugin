import { reduce, sortBy, forEach, cloneDeep, omit } from 'lodash';

const resourcesToUiResources = resources => sortBy(reduce(cloneDeep(resources), (result, values, id) => {
  result.push({
    _id: id,
    _tenantPatterns: sortBy(reduce(values.tenant_permissions, (result, values) => {
      forEach(values.tenant_patterns, pattern => {
        result.push(pattern);
      });
      return result;
    }, [])),
    _indexPatterns: sortBy(reduce(values.index_permissions, (result, values) => {
      forEach(values.index_patterns, pattern => {
        result.push(pattern);
      });
      return result;
    }, [])),
    _clusterPermissions: sortBy(values.cluster_permissions),
    ...omit(values, ['cluster_permissions'])
  });
  return result;
}, []), '_id');

export default resourcesToUiResources;
