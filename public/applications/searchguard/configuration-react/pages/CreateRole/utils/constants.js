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
  hosts: [],
};

export const FLS_MODES = {
  WHITELIST: 'whitelist',
  BLACKLIST: 'blacklist',
};

export const INDEX_PERMISSION = {
  allowed_actions: [],
  fls: [],
  flsmode: FLS_MODES.WHITELIST,
  index_patterns: [],
  masked_fields: [],
};

export const TENANT_PERMISSION = {
  tenant_patterns: [],
  allowed_actions: [],
};

export const TABS = {
  OVERVIEW: 'overview',
  CLUSTER_PERMISSIONS: 'clusterPermissions',
  INDEX_PERMISSIONS: 'indexPermissions',
  TENANT_PERMISSIONS: 'tenantPermissions',
};

export const GLOBAL_TENANT = 'SGS_GLOBAL_TENANT';
