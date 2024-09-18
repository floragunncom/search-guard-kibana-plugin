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

import {
  aliasPatternsText,
  aliasPermissionsText,
  dataStreamPatternsText, dataStreamPermissionsText,
  emptyAliasPermissionsText,
  emptyDataStreamPermissionsText,
  emptyIndexPermissionsText,
  indexPatternsText,
  indexPermissionsText
} from "../../../utils/i18n/roles";

export const ROLE = {
  _name: '',
  description: '',
  index_permissions: [],
  alias_permissions: [],
  data_stream_permissions: [],
  tenant_permissions: [],
  cluster_permissions: [],
  exclude_cluster_permissions: [],
  //exclude_index_permissions: [],
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

export const COMMON_PERMISSION_TYPES = {
  INDEX_PERMISSION: {
    permissionsProperty: '_indexPermissions',
    patternsProperty: 'index_patterns',
    selectPatternPlaceholder: 'Select indices',
    flsPatternPlaceholder: 'Add index pattern(s) to fetch the field names here',
    textPatterns: indexPatternsText,
    textEmptyPermissions: emptyIndexPermissionsText,
    textPermissions: indexPermissionsText,
    testSubjPrefix: 'sgRoleIndex',
  },
  ALIAS_PERMISSION: {
    permissionsProperty: '_aliasPermissions',
    patternsProperty: 'alias_patterns',
    selectPatternPlaceholder: 'Select aliases',
    flsPatternPlaceholder: 'Add alias pattern(s) to fetch the field names here',
    textPatterns: aliasPatternsText,
    textEmptyPermissions: emptyAliasPermissionsText,
    textPermissions: aliasPermissionsText,
    testSubjPrefix: 'sgRoleAlias',
  },
  DATA_STREAM_PERMISSION: {
    permissionsProperty: '_dataStreamPermissions',
    patternsProperty: 'data_stream_patterns',
    selectPatternPlaceholder: 'Select data streams',
    flsPatternPlaceholder: 'Add data stream pattern(s) to fetch the field names here',
    textPatterns: dataStreamPatternsText,
    textEmptyPermissions: emptyDataStreamPermissionsText,
    textPermissions: dataStreamPermissionsText,
    testSubjPrefix: 'sgRoleDataStream',
  }
};

export const GET_COMMON_PERMISSION = (patternsProperty = 'index_patterns') => {
  return {
    allowed_actions: [],
    fls: [],
    flsmode: FLS_MODES.WHITELIST,
    [patternsProperty]: [],
    masked_fields: [],
  };
}

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
  CLUSTER_EXCLUSIONS: 'clusterExclusions',
  INDEX_PERMISSIONS: 'indexPermissions',
  INDEX_EXCLUSIONS: 'indexExclusions',
  ALIAS_PERMISSIONS: 'aliasPermissions',
  DATA_STREAM_PERMISSION: 'dataStreamPermissions',
  TENANT_PERMISSIONS: 'tenantPermissions',
};

export const GLOBAL_TENANT = 'SGS_GLOBAL_TENANT';

export const MASKED_FIELD_TYPE = {
  HASH: 'hash',
  REGEX: 'regex',
};

export const MASKED_FIELD_TYPE_OPTIONS = [
  { value: MASKED_FIELD_TYPE.HASH, text: MASKED_FIELD_TYPE.HASH },
  { value: MASKED_FIELD_TYPE.REGEX, text: MASKED_FIELD_TYPE.REGEX },
];

export const MASKED_FIELDS_DEFAULTS = {
  value: '',
  fields: [],
  mask_type: MASKED_FIELD_TYPE.HASH,
};
