export const ROLE = {
  _name: '',
  description: '',
  index_permissions: [],
  tenant_permissions: [],
  cluster_permissions: [],
  exclude_cluster_permissions: [],
  exclude_index_permissions: [],
};

export const ROLE_MAPPING = {
  users: [],
  backend_roles: [],
  hosts: []
};

export const FLS_MODES = {
  WHITELIST: 'whitelist',
  BLACKLIST: 'blacklist'
};

export const INDEX_PERMISSION = {
  allowed_actions: [],
  fls: [],
  flsmode: FLS_MODES.WHITELIST,
  index_patterns: [],
  masked_fields: []
};

export const TENANT_PERMISSION = {
  tenant_patterns: [],
  allowed_actions: []
};

export const TABS = {
  OVERVIEW: 'overview',
  CLUSTER_PERMISSIONS: 'clusterPermissions',
  INDEX_PERMISSIONS: 'indexPermissions',
  TENANT_PERMISSIONS: 'tenantPermissions'
};

export const GLOBAL_TENANT = 'SGS_GLOBAL_TENANT';
