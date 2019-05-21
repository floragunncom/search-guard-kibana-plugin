import { omit } from 'lodash';

const uiResourceToResource = resource =>
  omit(resource, ['_tenantPatterns', '_indexPatterns', '_clusterPermissions', '_id']);

export default uiResourceToResource;
