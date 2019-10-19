import { omit, map, cloneDeep, isEmpty } from 'lodash';
import { comboBoxOptionsToArray } from '../../../utils/helpers';
import { FIELDS_TO_OMIT_BEFORE_SAVE } from '../../../utils/constants';
import { FLS_MODES } from './constants';

export const uiFlsToFls = (fls = [], flsmode) => comboBoxOptionsToArray(fls).map(field => {
  return flsmode === FLS_MODES.BLACKLIST ? '~' + field.replace(/^\~+/, '') : field;
});

export const uiIndexPermissionsToIndexPermissions = indexPermissions => {
  return map(indexPermissions, values => {
    const { actiongroups, permissions } = values.allowed_actions;
    const allowedActions = [
      ...comboBoxOptionsToArray(actiongroups),
      ...comboBoxOptionsToArray(permissions)
    ];
    const indexPatterns = comboBoxOptionsToArray(values.index_patterns);

    const result = {
      ...omit(values, '_isAdvanced', '_dls', 'flsmode'),
      allowed_actions: allowedActions,
      index_patterns: indexPatterns,
      fls: uiFlsToFls(values.fls, values.flsmode),
      masked_fields: comboBoxOptionsToArray(values.masked_fields)
    };

    if (!isEmpty(values._dls)) {
      result.dls = JSON.stringify(JSON.parse(values._dls));
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
      //allowed_actions: comboBoxOptionsToArray(allowedActions),
      allowed_actions: allowedActions,
      tenant_patterns: comboBoxOptionsToArray(tenantPatterns)
    };
  });
};

export const uiClusterPermissionsToClusterPermissions = clusterPermissions => {
  const { actiongroups, permissions } = clusterPermissions;
  return [
    ...comboBoxOptionsToArray(actiongroups),
    ...comboBoxOptionsToArray(permissions)
  ];
};

export const formikToRole = _formik => {
  const formik = cloneDeep(_formik);
  const clusterPermissions = uiClusterPermissionsToClusterPermissions(formik._clusterPermissions);
  const indexPermissions = uiIndexPermissionsToIndexPermissions(formik._indexPermissions);
  const tenantPermissions = uiTenantPermissionsToTenantPermissions(formik._tenantPermissions);

  return {
    ...omit(formik, [
      '_name',
      '_roleMapping',
      '_isClusterPermissionsAdvanced',
      '_clusterPermissions',
      '_indexPermissions',
      '_tenantPermissions',
      ...FIELDS_TO_OMIT_BEFORE_SAVE
    ]),
    cluster_permissions: clusterPermissions,
    index_permissions: indexPermissions,
    tenant_permissions: tenantPermissions
  };
};
