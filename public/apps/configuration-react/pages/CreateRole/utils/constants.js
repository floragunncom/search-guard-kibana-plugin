import { includeText, excludeText } from '../../../utils/i18n/common';

export const ROLE = {
  _name: '',
  description: '',
  index_permissions: [],
  tenant_permissions: [],
  cluster_permissions: [],
  _isClusterPermissionsAdvanced: false,
  global_application_permissions: []
};

export const ROLE_MAPPING = {
  users: [],
  backend_roles: [],
  hosts: []
};

export const FLS_MODES = [
  { id: 'whitelist', label: includeText },
  { id: 'blacklist', label: excludeText },
];

export const INDEX_PERMISSION = {
  allowed_actions: [],
  fls: [],
  flsmode: FLS_MODES[0].id,
  index_patterns: [],
  masked_fields: []
};

export const TENANT_PERMISSION = {
  tenant_patterns: [],
  allowed_actions: []
};

export const APP_ACTION_GROUPS = ['SGS_KIBANA_ALL_READ', 'SGS_KIBANA_ALL_WRITE'];

export const TABS = {
  OVERVIEW: 'overview',
  CLUSTER_PERMISSIONS: 'clusterPermissions',
  INDEX_PERMISSIONS: 'indexPermissions',
  TENANT_PERMISSIONS: 'tenantPermissions'
};
