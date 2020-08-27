/* eslint-disable @kbn/eslint/require-license-header */
import { cloneDeep, map, defaultsDeep, isEmpty, sortBy } from 'lodash';
import { FLS_MODES, ROLE, ROLE_MAPPING } from './constants';
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

export const indicesToUiIndices = indices => {
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

export const flsmodeAndFlsToUiFlsmoddeAndFls = (fls = []) => {
  let _fls = [];
  let flsmode = FLS_MODES.WHITELIST;
  const isFlsBlacklist = !isEmpty(fls) && fls[0].startsWith('~');

  if (isFlsBlacklist) {
    flsmode = FLS_MODES.BLACKLIST;
    _fls = arrayToComboBoxOptions(map(fls, field => field.slice(1)));
  } else {
    _fls = arrayToComboBoxOptions(fls);
  }

  return { flsmode, fls: _fls };
};

export const dlsToUiDls = dlsQuery => {
  let _dlsQuery = '';
  if (!isEmpty(dlsQuery)) {
    try {
      _dlsQuery = stringifyPretty(JSON.parse(dlsQuery));
    } catch (error) {
      // Keep '' if .dls query can't be parsed
    }
  }
  return _dlsQuery;
};

export const indexPermissionToUiIndexPermission = indexPermission =>  {
  const { actiongroups, permissions } = allowedActionsToPermissionsAndActiongroups(indexPermission.allowed_actions);
  const allowedActions = {
    actiongroups: arrayToComboBoxOptions(actiongroups),
    permissions: arrayToComboBoxOptions(permissions)
  };
  const indexPatterns = arrayToComboBoxOptions(indexPermission.index_patterns);

  return {
    ...indexPermission,
    ...flsmodeAndFlsToUiFlsmoddeAndFls(indexPermission.fls),
    _dls: dlsToUiDls(indexPermission.dls),
    allowed_actions: allowedActions,
    index_patterns: indexPatterns,
    masked_fields: arrayToComboBoxOptions(indexPermission.masked_fields),
    _isAdvanced: !isEmpty(allowedActions.permissions),
  };
};

export const clusterPermissionsToUiClusterPermissions = clusterPermissions => {
  const { actiongroups, permissions } = allowedActionsToPermissionsAndActiongroups(clusterPermissions);
  return {
    actiongroups: arrayToComboBoxOptions(actiongroups),
    permissions: arrayToComboBoxOptions(permissions)
  };
};

export const roleToFormik = ({ resource, roleMapping = {}, id = '' }) => {
  const formik = defaultsDeep(cloneDeep(resource), ROLE);
  const _roleMapping = defaultsDeep(cloneDeep(roleMapping), ROLE_MAPPING);
  const _clusterPermissions = clusterPermissionsToUiClusterPermissions(formik.cluster_permissions);
  const _indexPermissions = map(formik.index_permissions, indexPermissionToUiIndexPermission);
  const _tenantPermissions = map(formik.tenant_permissions, tenantPermissionToUiTenantPermission);

  return {
    ...formik,
    _name: id,
    _roleMapping,
    _clusterPermissions,
    _indexPermissions,
    _tenantPermissions,
    _isClusterPermissionsAdvanced: !isEmpty(_clusterPermissions.permissions)
  };
};
