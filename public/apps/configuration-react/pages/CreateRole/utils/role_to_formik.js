import { cloneDeep, map, defaultsDeep } from 'lodash';
import { FLS_MODES, ROLE, ROLE_MAPPING } from './constants';
import {
  allowedActionsToPermissionsAndActiongroups,
  arrayToComboBoxOptions,
  stringifyPretty
} from '../../../utils/helpers';

export const indicesToUiIndices = indices => arrayToComboBoxOptions(Object.keys(indices));

export const tenantPermissionToUiTenantPermission = tenantPermission => {
  const {
    tenant_patterns: tenantPatterns = [],
    allowed_actions: allowedActions = []
  } = tenantPermission;

  return {
    allowed_actions: arrayToComboBoxOptions(allowedActions),
    tenant_patterns: arrayToComboBoxOptions(tenantPatterns)
  };
};

export const indexPermissionToUiIndexPermission = indexPermission =>  {
  const { actiongroups, permissions } = allowedActionsToPermissionsAndActiongroups(indexPermission.allowed_actions);
  const allowedActions = {
    actiongroups: arrayToComboBoxOptions(actiongroups),
    permissions: arrayToComboBoxOptions(permissions)
  };
  const indexPatterns = arrayToComboBoxOptions(indexPermission.index_patterns);

  let _dls = '{}';
  if (indexPermission.dls) {
    _dls = stringifyPretty(JSON.parse(_dls));
  }

  return {
    ...indexPermission,
    _dls,
    allowed_actions: allowedActions,
    index_patterns: indexPatterns,
    fls: arrayToComboBoxOptions(indexPermission.fls),
    masked_fields: arrayToComboBoxOptions(indexPermission.masked_fields),
    _isAdvanced: false,
    flsmode: FLS_MODES[0].id
  };
};

export const clusterPermissionsToUiClusterPermissions = clusterPermissions => {
  const { actiongroups, permissions } = allowedActionsToPermissionsAndActiongroups(clusterPermissions);
  return {
    actiongroups: arrayToComboBoxOptions(actiongroups),
    permissions: arrayToComboBoxOptions(permissions)
  };
};

export const roleToFormik = ({ resource, roleMapping, id = '' } = {}) => {
  const formik = defaultsDeep(cloneDeep(resource), ROLE);
  const _roleMapping = defaultsDeep(cloneDeep(roleMapping), ROLE_MAPPING);
  const _clusterPermissions = clusterPermissionsToUiClusterPermissions(formik.cluster_permissions);
  const _indexPermissions = map(formik.index_permissions, indexPermissionToUiIndexPermission);
  const _tenantPermissions = map(formik.tenant_permissions, tenantPermissionToUiTenantPermission);
  const _globalApplicationPermissions = arrayToComboBoxOptions(formik.global_application_permissions);

  return {
    ...formik,
    _name: id,
    _roleMapping,
    _clusterPermissions,
    _indexPermissions,
    _tenantPermissions,
    _globalApplicationPermissions
  };
};
