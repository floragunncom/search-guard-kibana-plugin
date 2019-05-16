import { reduce, sortBy, forEach, map } from 'lodash';
import { allowedActionsToPermissionsAndActiongroups } from '../../../utils/helpers';

const resourcesToUiResources = resources => reduce(resources, (result, values, id) => {
  result.push({
    id,
    allRoleTenantPatterns: sortBy(reduce(values.tenant_permissions, (result, values) => {
      forEach(values.tenant_patterns, pattern => {
        result.push(pattern);
      });
      return result;
    }, [])),
    allRoleIndexPatterns: sortBy(reduce(values.index_permissions, (result, values) => {
      forEach(values.index_patterns, pattern => {
        result.push(pattern);
      });
      return result;
    }, [])),
    allRoleClusterPermissions: sortBy(values.cluster_permissions),
    ...values,
    index_permissions: map(values.index_permissions, values => {
      values.allowed_actions = allowedActionsToPermissionsAndActiongroups(values.allowed_actions);
      return values;
    }),
    cluster_permissions: allowedActionsToPermissionsAndActiongroups(values.cluster_permissions)
  });
  return result;
}, []);

export default resourcesToUiResources;
