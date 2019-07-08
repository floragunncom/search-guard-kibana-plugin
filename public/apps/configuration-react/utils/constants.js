export const DEFAULT_PASSWORD = 'admin';

export const API_BASE = '../api/v1';
export const API = {
  SYSTEM_INFO: `${API_BASE}/systeminfo`,
  LICENSE: `${API_BASE}/license`,
  INDICES: `${API_BASE}/configuration/indices`,
  VALIDATE_DLS: `${API_BASE}/configuration/validatedls`,
  INDEX_MAPPINGS: `${API_BASE}/configuration/index_mappings`
};

export const APP_PATH = {
  HOME: '/',
  INTERNAL_USERS: '/internal-users',
  CREATE_INTERNAL_USER: '/create-internal-user',
  AUTH: '/auth',
  SYSTEM_STATUS: '/system-status',
  TENANTS: '/tenants',
  CREATE_TENANT: '/create-tenant',
  ACTION_GROUPS: '/action-groups',
  CREATE_ACTION_GROUP: '/create-action-group',
  ROLES: '/roles',
  CREATE_ROLE: '/create-role',
  ROLE_MAPPINGS: '/role-mappings',
  CREATE_ROLE_MAPPING: '/create-role-mapping'
};

export const SYSTEM_STATUS_ACTIONS = {
  UPLOAD_LICENSE: 'upload-license'
};

export const INTERNAL_USERS_ACTIONS = {
  UPDATE_USER: 'update-user'
};

export const TENANTS_ACTIONS = {
  UPDATE_TENANT: 'update-tenant'
};

export const ACTION_GROUPS_ACTIONS = {
  UPDATE_ACTION_GROUP: 'update-action-group'
};

export const ROLES_ACTIONS = {
  UPDATE_ROLE: 'update-role'
};

export const ROLE_MAPPINGS_ACTIONS = {
  UPDATE_ROLE_MAPPING: 'update-role-mapping'
};

export const FLYOUTS = {
  INSPECT_JSON: 'inspectJson',
  CUSTOM: 'customFlyout'
};

export const CALLOUTS = {
  ERROR_CALLOUT: 'errorCallout',
  SUCCESS_CALLOUT: 'successCallout'
};

export const SESSION_STORAGE = {
  SG_USER: 'sg_user',
  SYSTEMINFO: 'systeminfo',
  RESTAPIINFO: 'restapiinfo'
};

export const MODALS = {
  CONFIRM_DELETION: 'confirmDeletion'
};

export { default as INDEX_PERMISSIONS } from '../../configuration/permissions/indexpermissions';
export { default as CLUSTER_PERMISSIONS } from '../../configuration/permissions/clusterpermissions';

export const FIELDS_TO_OMIT_BEFORE_SAVE = ['reserved', 'static', 'hidden'];

export const LOCAL_STORAGE_NAME = 'app_cache';
const LOCAL_STORAGE_COMMON = {
  isShowingTableSystemItems: false
};
export const LOCAL_STORAGE = {
  [APP_PATH.ROLE_MAPPINGS]: {
    ...LOCAL_STORAGE_COMMON
  },
  [APP_PATH.INTERNAL_USERS]: {
    ...LOCAL_STORAGE_COMMON
  },
  [APP_PATH.ROLE_MAPPINGS]: {
    ...LOCAL_STORAGE_COMMON
  },
  [APP_PATH.ROLES]: {
    ...LOCAL_STORAGE_COMMON
  },
  [APP_PATH.ACTION_GROUPS]: {
    ...LOCAL_STORAGE_COMMON
  },
  [APP_PATH.TENANTS]: {
    ...LOCAL_STORAGE_COMMON
  },
};
