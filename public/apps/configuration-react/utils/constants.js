export const DEFAULT_PASSWORD = 'admin';

export const API_BASE = '../api/search-guard-configuration';
export const API = {
  INTERNAL_USERS: `${API_BASE}/configuration/internalusers`,
};

export const APP_PATH = {
  HOME: '/',
  INTERNAL_USERS: '/internal-users',
  CREATE_INTERNAL_USER: '/create-internal-user',
  AUTH: '/auth'
};

export const INTERNAL_USERS_ACTIONS = {
  UPDATE_USER: 'update-user'
};

export const FLYOUTS = {
  INSPECT_JSON: 'inspectJson'
};

export const CALLOUTS = {
  ERROR_CALLOUT: 'errorCallout'
};

export const SESSION_STORAGE = {
  SG_USER: 'sg_user'
};
