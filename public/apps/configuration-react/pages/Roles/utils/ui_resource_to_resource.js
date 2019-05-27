import { omit } from 'lodash';
import { allowedActionsToPermissionsAndActiongroups } from '../../../utils/helpers';

const uiResourceToResource = resource => {
  return {
    ...omit(resource, ['_tenantPatterns', '_indexPatterns', '_clusterPermissions', '_id']),
    cluster_permissions: allowedActionsToPermissionsAndActiongroups(resource.cluster_permissions)
  };
};

export default uiResourceToResource;
