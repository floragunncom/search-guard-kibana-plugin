import { omit } from 'lodash';

const uiResourceToResource = resource =>
  omit(resource, ['allRoleTenantPatterns', 'allRoleIndexPatterns', 'allRoleClusterPermissions', 'id']);

export default uiResourceToResource;
