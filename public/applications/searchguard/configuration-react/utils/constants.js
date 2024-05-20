/*
 *    Copyright 2020 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export const DEFAULT_PASSWORD = 'admin';

export const API_BASE = '../api/v1';
export const API = {
  SYSTEM_INFO: `${API_BASE}/systeminfo`,
  REST_API_INFO: `${API_BASE}/restapiinfo`,
  LICENSE: `${API_BASE}/license`,
  INDICES: `${API_BASE}/configuration/indices`,
  ALIASES: `${API_BASE}/configuration/aliases`,
  DATA_STREAMS: `${API_BASE}/configuration/data_streams`,
  INDEX_MAPPINGS: `${API_BASE}/configuration/index_mappings`,
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
  CREATE_ROLE_MAPPING: '/create-role-mapping',
};

export const SYSTEM_STATUS_ACTIONS = {
  UPLOAD_LICENSE: 'upload-license',
};

export const INTERNAL_USERS_ACTIONS = {
  UPDATE_USER: 'update-user',
};

export const TENANTS_ACTIONS = {
  UPDATE_TENANT: 'update-tenant',
};

export const ACTION_GROUPS_ACTIONS = {
  UPDATE_ACTION_GROUP: 'update-action-group',
};

export const ROLES_ACTIONS = {
  UPDATE_ROLE: 'update-role',
};

export const ROLE_MAPPINGS_ACTIONS = {
  UPDATE_ROLE_MAPPING: 'update-role-mapping',
};

export const FLYOUTS = {
  INSPECT_JSON: 'inspectJson',
};

export { default as INDEX_PERMISSIONS } from './permissions/indexpermissions';
export { default as CLUSTER_PERMISSIONS } from './permissions/clusterpermissions';

export const FIELDS_TO_OMIT_BEFORE_SAVE = ['reserved', 'static', 'hidden'];

export const LOCAL_STORAGE_NAME = 'app_cache';
const LOCAL_STORAGE_COMMON = {
  isShowingTableSystemItems: false,
};
export const LOCAL_STORAGE = {
  [APP_PATH.ROLE_MAPPINGS]: {
    ...LOCAL_STORAGE_COMMON,
  },
  [APP_PATH.INTERNAL_USERS]: {
    ...LOCAL_STORAGE_COMMON,
  },
  [APP_PATH.ROLE_MAPPINGS]: {
    ...LOCAL_STORAGE_COMMON,
  },
  [APP_PATH.ROLES]: {
    ...LOCAL_STORAGE_COMMON,
  },
  [APP_PATH.ACTION_GROUPS]: {
    ...LOCAL_STORAGE_COMMON,
  },
  [APP_PATH.TENANTS]: {
    ...LOCAL_STORAGE_COMMON,
  },
};

export const CALLOUTS = {
  ERROR_CALLOUT: 'errorCallout',
  SUCCESS_CALLOUT: 'successCallout',
};

export { DOC_LINKS } from '../../../utils/constants';

export const PAGE_NAMES = {
  action_groups_page: 'action_groups_page',
  create_action_groups_page: 'create_action_groups_page',
  internal_users_page: 'internal_users_page',
  create_internal_users_page: 'create_internal_users_page',
  roles_page: 'roles_page',
  create_roles_page: 'create_roles_page',
  role_mappings_page: 'role_mappings_page',
  create_role_mappings_page: 'create_role_mappings_page',
  tenants_page: 'tenants_page',
  create_tenants_page: 'create_tenants_page',
  system_status_page: 'system_status_page',
  license_page: 'license_page',
  cache_page: 'cache_page',
};

export const PAGE_CONFIGS = {
  [PAGE_NAMES.action_groups_page]: {
    api: {
      method: 'GET',
      endpoint: 'ACTIONGROUPS',
    },
  },
  [PAGE_NAMES.create_action_groups_page]: {
    api: {
      method: 'GET',
      endpoint: 'ACTIONGROUPS',
    },
  },
  [PAGE_NAMES.internal_users_page]: {
    api: {
      method: 'GET',
      endpoint: 'INTERNALUSERS',
    },
  },
  [PAGE_NAMES.create_internal_users_page]: {
    api: {
      method: 'GET',
      endpoint: 'INTERNALUSERS',
    },
  },
  [PAGE_NAMES.roles_page]: {
    api: {
      method: 'GET',
      endpoint: 'ROLES',
    },
  },
  [PAGE_NAMES.create_roles_page]: {
    api: {
      method: 'GET',
      endpoint: 'ROLES',
    },
  },
  [PAGE_NAMES.role_mappings_page]: {
    api: {
      method: 'GET',
      endpoint: 'ROLESMAPPING',
    },
  },
  [PAGE_NAMES.create_role_mappings_page]: {
    api: {
      method: 'GET',
      endpoint: 'ROLESMAPPING',
    },
  },
  [PAGE_NAMES.tenants_page]: {
    api: {
      method: 'GET',
      endpoint: 'TENANTS',
    },
  },
  [PAGE_NAMES.create_tenants_page]: {
    api: {
      method: 'GET',
      endpoint: 'TENANTS',
    },
  },
  [PAGE_NAMES.system_status_page]: {
    api: {
      method: 'GET',
      endpoint: 'SGCONFIG',
    },
  },
  [PAGE_NAMES.auth_page]: {
    api: {
      method: 'GET',
      endpoint: 'SGCONFIG',
    },
  },
  [PAGE_NAMES.license_page]: {
    api: {
      method: 'GET',
      endpoint: 'LICENSE',
    },
  },
  [PAGE_NAMES.cache_page]: {
    api: {
      method: 'GET',
      endpoint: 'CACHE',
    },
  },
};
