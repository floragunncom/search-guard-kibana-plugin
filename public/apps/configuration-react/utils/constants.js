export const DEFAULT_PASSWORD = 'admin';

export const API_BASE = '../api/v1';
export const API = {
  SYSTEM_INFO: `${API_BASE}/systeminfo`,
  LICENSE: `${API_BASE}/license`
};

export const APP_PATH = {
  HOME: '/',
  INTERNAL_USERS: '/internal-users',
  CREATE_INTERNAL_USER: '/create-internal-user',
  AUTH: '/auth',
  SYSTEM_STATUS: '/system-status',
  TENANTS: '/tenants',
  CREATE_TENANT: '/create-tenant'
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
