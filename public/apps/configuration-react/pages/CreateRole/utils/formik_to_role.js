import { omit, map, cloneDeep, isEmpty } from 'lodash';
import { comboBoxOptionsToArray } from '../../../utils/helpers';

export const uiIndexPermissionsToIndexPermissions = indexPermissions => {
  return map(indexPermissions, values => {
    const { actiongroups, permissions } = values.allowed_actions;
    const allowedActions = {
      actiongroups: comboBoxOptionsToArray(actiongroups),
      permissions: comboBoxOptionsToArray(permissions)
    };
    const indexPatterns = comboBoxOptionsToArray(values.index_patterns);

    const result = {
      ...omit(values, '_isAdvanced', '_dls'),
      allowed_actions: allowedActions,
      index_patterns: indexPatterns,
      fls: comboBoxOptionsToArray(values.fls),
      masked_fields: comboBoxOptionsToArray(values.masked_fields)
    };

    if (!isEmpty(JSON.parse(values._dls))) {
      result.dls = JSON.stringify(JSON.parse(values._dls));
    }

    if (isEmpty(result.fls)) {
      delete result.flsmode;
    }

    return result;
  });
};

export const uiTenantPermissionsToTenantPermissions = tenantPermissions => {
  return map(tenantPermissions, values => {
    const {
      tenant_patterns: tenantPatterns,
      allowed_actions: allowedActions
    } = values;

    return {
      allowed_actions: comboBoxOptionsToArray(allowedActions),
      tenant_patterns: comboBoxOptionsToArray(tenantPatterns)
    };
  });
};

export const uiClusterPermissionsToClusterPermissions = clusterPermissions => {
  const { actiongroups, permissions } = clusterPermissions;
  return {
    actiongroups: comboBoxOptionsToArray(actiongroups),
    permissions: comboBoxOptionsToArray(permissions)
  };
};

const formikToRole = _formik => {
  const formik = cloneDeep(_formik);
  const clusterPermissions = uiClusterPermissionsToClusterPermissions(formik._clusterPermissions);
  const indexPermissions = uiIndexPermissionsToIndexPermissions(formik._indexPermissions);
  const tenantPermissions = uiTenantPermissionsToTenantPermissions(formik._tenantPermissions);
  const globalApplicationPermissions = comboBoxOptionsToArray(formik._globalApplicationPermissions);

  return {
    ...omit(formik, [
      '_name',
      '_roleMapping',
      '_isClusterPermissionsAdvanced',
      '_clusterPermissions',
      '_indexPermissions',
      '_globalApplicationPermissions',
      '_tenantPermissions'
    ]),
    cluster_permissions: clusterPermissions,
    index_permissions: indexPermissions,
    tenant_permissions: tenantPermissions,
    global_application_permissions: globalApplicationPermissions
  };
};

export default formikToRole;
