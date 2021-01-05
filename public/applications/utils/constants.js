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

export const CODE_EDITOR = {
  theme: 'textmate',
  darkTheme: 'twilight',
  tabSize: 2,
  useSoftTabs: true,
  highlightActiveLine: true,
};

export const MODALS = {
  CONFIRM: 'confirm',
  CONFIRM_DELETION: 'confirmDeletion',
  ERROR_TOAST_DETAILS: 'errorToastDetails',
};

export const CALLOUTS = {
  ERROR_CALLOUT: 'errorCallout',
  SUCCESS_CALLOUT: 'successCallout',
};

export const DOC_LINKS = {
  CONFIGURE_INTERNAL_USERS_DATABASE:
    'https://docs.search-guard.com/latest/internal-users-database#configuring-the-internal-users-database',
  MAPPING_USERS_ROLES: 'https://docs.search-guard.com/latest/mapping-users-roles',
  ROLE_PERMISSIONS: 'https://docs.search-guard.com/latest/roles-permissions',
  ROLE_PERMISSIONS_CLUSTER:
    'https://docs.search-guard.com/latest/roles-permissions#cluster-level-permissions',
  ROLE_PERMISSIONS_INDEX:
    'https://docs.search-guard.com/latest/roles-permissions#index-level-permissions',
  ROLE_PERMISSIONS_EXCLUSIONS:
    'https://docs.search-guard.com/latest/roles-permissions#permission-exclusions',
  ACTION_GROUPS: 'https://docs.search-guard.com/latest/action-groups',
  MULTITENANCY: 'https://docs.search-guard.com/latest/kibana-multi-tenancy#kibana-multitenancy',
  AUTHENTICATION: 'https://docs.search-guard.com/latest/kibana-authentication-types',
  AUTHENTICATION_API: 'https://docs.search-guard.com/latest/rest-api-authentication',
  SGADMIN: 'https://docs.search-guard.com/latest/sgadmin-basic-usage',
  MAIN_CONCEPTS: 'https://docs.search-guard.com/latest/main-concepts',
  LICENSING: 'https://search-guard.com/licensing/',
  BACKEND_ROLES:
    'https://docs.search-guard.com/latest/troubleshooting-search-guard-user-roles#backend-roles',
  ANONYMIZE_FIELDS:
    'https://docs.search-guard.com/latest/field-anonymization#anonymize-fields-in-elasticsearch-documents',
  FIELD_LEVEL_SECURITY: 'https://docs.search-guard.com/latest/field-level-security',
  DOCUMENT_LEVEL_SECURITY: 'https://docs.search-guard.com/latest/document-level-security',
};
