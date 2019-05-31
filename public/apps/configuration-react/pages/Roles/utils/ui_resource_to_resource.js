import { omit } from 'lodash';
import { allowedActionsToPermissionsAndActiongroups } from '../../../utils/helpers';
import { FIELDS_TO_OMIT_BEFORE_SAVE } from '../../../utils/constants';

const uiResourceToResource = resource => {
  return {
    ...omit(resource, [
      '_tenantPatterns',
      '_indexPatterns',
      '_clusterPermissions',
      '_id',
      ...FIELDS_TO_OMIT_BEFORE_SAVE
    ]),
    cluster_permissions: allowedActionsToPermissionsAndActiongroups(resource._clusterPermissions)
  };
};

export default uiResourceToResource;
