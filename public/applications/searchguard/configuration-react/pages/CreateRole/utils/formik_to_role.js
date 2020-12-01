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

import { omit, map, cloneDeep, isEmpty } from 'lodash';
import { comboBoxOptionsToArray } from '../../../utils/helpers';
import { FIELDS_TO_OMIT_BEFORE_SAVE } from '../../../utils/constants';
import { FLS_MODES } from './constants';

export const uiFlsToFls = (fls = [], flsmode) =>
  comboBoxOptionsToArray(fls).map((field) => {
    return flsmode === FLS_MODES.BLACKLIST ? '~' + field.replace(/^\~+/, '') : field;
  });

export const uiExcludeIndexPermissionsToExcludeIndexPermissions = (excludeIndexPermissions) => {
  return map(excludeIndexPermissions, (values) => {
    const { actiongroups, permissions } = values.actions;
    const actions = [
      ...comboBoxOptionsToArray(actiongroups),
      ...comboBoxOptionsToArray(permissions),
    ];
    const indexPatterns = comboBoxOptionsToArray(values.index_patterns);

    return {
      actions,
      index_patterns: indexPatterns,
    };
  });
};

export const uiIndexPermissionsToIndexPermissions = (indexPermissions) => {
  return map(indexPermissions, (values) => {
    const { actiongroups, permissions } = values.allowed_actions;
    const allowedActions = [
      ...comboBoxOptionsToArray(actiongroups),
      ...comboBoxOptionsToArray(permissions),
    ];
    const indexPatterns = comboBoxOptionsToArray(values.index_patterns);

    const result = {
      ...omit(values, '_isAdvanced', '_dls', 'flsmode'),
      allowed_actions: allowedActions,
      index_patterns: indexPatterns,
      fls: uiFlsToFls(values.fls, values.flsmode),
      masked_fields: comboBoxOptionsToArray(values.masked_fields),
    };

    if (!isEmpty(values._dls)) {
      result.dls = JSON.stringify(JSON.parse(values._dls));
    } else {
      delete result.dls;
    }

    return result;
  });
};

export const uiTenantPermissionsToTenantPermissions = (tenantPermissions) => {
  return map(tenantPermissions, (values) => {
    const { tenant_patterns: tenantPatterns, allowed_actions: allowedActions } = values;

    return {
      allowed_actions: comboBoxOptionsToArray(allowedActions),
      tenant_patterns: comboBoxOptionsToArray(tenantPatterns),
    };
  });
};

export const uiClusterPermissionsToClusterPermissions = (clusterPermissions) => {
  const { actiongroups, permissions } = clusterPermissions;
  return [...comboBoxOptionsToArray(actiongroups), ...comboBoxOptionsToArray(permissions)];
};

export const formikToRole = (_formik) => {
  const formik = cloneDeep(_formik);
  const clusterPermissions = uiClusterPermissionsToClusterPermissions(formik._clusterPermissions);
  const excludeClusterPermissions = uiClusterPermissionsToClusterPermissions(
    formik._excludeClusterPermissions
  );
  const indexPermissions = uiIndexPermissionsToIndexPermissions(formik._indexPermissions);
  const excludeIndexPermissions = uiExcludeIndexPermissionsToExcludeIndexPermissions(
    formik._excludeIndexPermissions
  );
  const tenantPermissions = uiTenantPermissionsToTenantPermissions(formik._tenantPermissions);

  return {
    ...omit(formik, [
      '_name',
      '_roleMapping',
      '_isClusterPermissionsAdvanced',
      '_isClusterExclusionsAdvanced',
      '_clusterPermissions',
      '_excludeClusterPermissions',
      '_indexPermissions',
      '_excludeIndexPermissions',
      '_tenantPermissions',
      ...FIELDS_TO_OMIT_BEFORE_SAVE,
    ]),
    cluster_permissions: clusterPermissions,
    index_permissions: indexPermissions,
    tenant_permissions: tenantPermissions,
    exclude_cluster_permissions: excludeClusterPermissions,
    exclude_index_permissions: excludeIndexPermissions,
  };
};
