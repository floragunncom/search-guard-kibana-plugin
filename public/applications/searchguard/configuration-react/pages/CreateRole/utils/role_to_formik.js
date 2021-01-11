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

import { cloneDeep, map, defaultsDeep, isEmpty, sortBy } from 'lodash';
import {
  FLS_MODES,
  ROLE,
  ROLE_MAPPING,
  MASKED_FIELD_TYPE,
  MASKED_FIELDS_DEFAULTS,
} from './constants';
import {
  allowedActionsToPermissionsAndActiongroups,
  arrayToComboBoxOptions,
  stringifyPretty,
} from '../../../utils/helpers';

export const tenantsToUiTenants = (tenants = {}) => arrayToComboBoxOptions(Object.keys(tenants));

export function actionGroupsToUiClusterIndexTenantActionGroups(actionGroups = {}) {
  const allClusterActionGroups = [];
  const allIndexActionGroups = [];
  const allTenantActionGroups = [];

  function handleSignalsActionGroups(actionGroupName) {
    switch (actionGroupName) {
      case 'SGS_SIGNALS_ACCOUNT_READ':
      case 'SGS_SIGNALS_ACCOUNT_MANAGE':
        allClusterActionGroups.push({ label: actionGroupName });
        break;
      case 'SGS_SIGNALS_WATCH_READ':
      case 'SGS_SIGNALS_WATCH_MANAGE':
      case 'SGS_SIGNALS_WATCH_EXECUTE':
      case 'SGS_SIGNALS_WATCH_ACTIVATE':
      case 'SGS_SIGNALS_WATCH_ACKNOWLEDGE':
        allTenantActionGroups.push({ label: actionGroupName });
        break;
      default:
        break;
    }
  }

  Object.keys(actionGroups)
    .sort()
    .forEach((label) => {
      switch (actionGroups[label].type) {
        case 'index':
          allIndexActionGroups.push({ label });
          break;
        case 'cluster':
          allClusterActionGroups.push({ label });
          break;
        case 'kibana':
          allTenantActionGroups.push({ label });
          break;
        case 'all':
          allIndexActionGroups.push({ label });
          allClusterActionGroups.push({ label });
          break;
        case 'signals':
          handleSignalsActionGroups(label);
          break;
        default:
          break;
      }
    });

  return {
    allClusterActionGroups,
    allIndexActionGroups,
    allTenantActionGroups,
  };
}

export const indicesToUiIndices = (indices) => {
  const colors = {
    red: 'danger',
    green: 'primary',
    yellow: 'warning',
    default: 'hollow',
  };

  return sortBy(
    indices.map(({ index, alias, health = 'default' }) => {
      return { label: alias ? alias : index, color: colors[health] };
    }),
    'label'
  );
};

export const tenantPermissionToUiTenantPermission = (tenantPermission) => {
  const {
    tenant_patterns: tenantPatterns = [],
    allowed_actions: allowedActions = [],
  } = tenantPermission;

  return {
    allowed_actions: arrayToComboBoxOptions(allowedActions),
    tenant_patterns: arrayToComboBoxOptions(tenantPatterns),
  };
};

export const flsmodeAndFlsToUiFlsmoddeAndFls = (fls = []) => {
  let _fls = [];
  let flsmode = FLS_MODES.WHITELIST;
  const isFlsBlacklist = !isEmpty(fls) && fls[0].startsWith('~');

  if (isFlsBlacklist) {
    flsmode = FLS_MODES.BLACKLIST;
    _fls = arrayToComboBoxOptions(map(fls, (field) => field.slice(1)));
  } else {
    _fls = arrayToComboBoxOptions(fls);
  }

  return { flsmode, fls: _fls };
};

export const excludeIndexPermissionToUiExcludeIndexPermission = (excludeIndexPermission) => {
  const { actiongroups, permissions } = allowedActionsToPermissionsAndActiongroups(
    excludeIndexPermission.actions
  );
  const actions = {
    actiongroups: arrayToComboBoxOptions(actiongroups),
    permissions: arrayToComboBoxOptions(permissions),
  };
  const indexPatterns = arrayToComboBoxOptions(excludeIndexPermission.index_patterns);

  return {
    actions,
    index_patterns: indexPatterns,
    _isAdvanced: !isEmpty(actions.permissions),
  };
};

// The masked fields are grouped by their mask value: hash or regex.
export function maskedFieldsToUiMaskedFields(maskedFields) {
  if (maskedFields.length === 0) {
    return [cloneDeep(MASKED_FIELDS_DEFAULTS)];
  }

  const uiMaskedFields = [];
  const values = {};
  const types = new Map();

  for (const rawField of maskedFields) {
    const [fieldName, ...rawValue] = rawField.split('::');
    const maskType = rawValue.length > 1 ? MASKED_FIELD_TYPE.REGEX : MASKED_FIELD_TYPE.HASH;
    const maskValue = rawValue.join('::');

    if (!values[maskValue]) {
      values[maskValue] = [];
    }

    types.set(maskValue, maskType);
    values[maskValue].push({ label: fieldName });
  }

  for (const maskValue of Object.keys(values)) {
    uiMaskedFields.push({
      value: maskValue,
      fields: values[maskValue],
      mask_type: types.get(maskValue),
    });
  }

  return sortBy(uiMaskedFields, 'value');
}

export const indexPermissionToUiIndexPermission = (indexPermission) => {
  const { actiongroups, permissions } = allowedActionsToPermissionsAndActiongroups(
    indexPermission.allowed_actions
  );
  const allowedActions = {
    actiongroups: arrayToComboBoxOptions(actiongroups),
    permissions: arrayToComboBoxOptions(permissions),
  };
  const indexPatterns = arrayToComboBoxOptions(indexPermission.index_patterns);

  return {
    ...indexPermission,
    ...flsmodeAndFlsToUiFlsmoddeAndFls(indexPermission.fls),
    _dls: indexPermission.dls,
    allowed_actions: allowedActions,
    index_patterns: indexPatterns,
    masked_fields: maskedFieldsToUiMaskedFields(indexPermission.masked_fields),
    masked_fields_advanced: arrayToComboBoxOptions(indexPermission.masked_fields),
    _isAdvanced: !isEmpty(allowedActions.permissions),
    _isAdvancedFLSMaskedFields: false,
  };
};

export const clusterPermissionsToUiClusterPermissions = (clusterPermissions) => {
  const { actiongroups, permissions } = allowedActionsToPermissionsAndActiongroups(
    clusterPermissions
  );
  return {
    actiongroups: arrayToComboBoxOptions(actiongroups),
    permissions: arrayToComboBoxOptions(permissions),
  };
};

export const roleToFormik = ({ resource, roleMapping = {}, id = '' }) => {
  const formik = defaultsDeep(cloneDeep(resource), ROLE);
  const _roleMapping = defaultsDeep(cloneDeep(roleMapping), ROLE_MAPPING);
  const _clusterPermissions = clusterPermissionsToUiClusterPermissions(formik.cluster_permissions);
  const _excludeClusterPermissions = clusterPermissionsToUiClusterPermissions(
    formik.exclude_cluster_permissions
  );
  const _indexPermissions = map(formik.index_permissions, indexPermissionToUiIndexPermission);
  const _excludeIndexPermissions = map(
    formik.exclude_index_permissions,
    excludeIndexPermissionToUiExcludeIndexPermission
  );
  const _tenantPermissions = map(formik.tenant_permissions, tenantPermissionToUiTenantPermission);

  return {
    ...formik,
    _name: id,
    _roleMapping,
    _clusterPermissions,
    _excludeClusterPermissions,
    _indexPermissions,
    _excludeIndexPermissions,
    _tenantPermissions,
    _isClusterPermissionsAdvanced: !isEmpty(_clusterPermissions.permissions),
    _isClusterExclusionsAdvanced: !isEmpty(_excludeClusterPermissions.permissions),
  };
};
