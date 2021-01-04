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

import { INDEX_PERMISSIONS, CLUSTER_PERMISSIONS } from '../constants';
import { get, reduce, sortBy, uniqBy, map, filter } from 'lodash';
import { configure } from 'enzyme';

export { default as sideNavItem } from './sideNavItem';

export const stringifyPretty = (json) => JSON.stringify(json, null, 2);

export const checkIfLicenseValid = (configService) => ({
  isValid: configService.get('systeminfo.sg_license.is_valid', false),
  messages: configService.get('systeminfo.sg_license.msgs', []),
});

export const readFileAsText = (file, FileReader = window.FileReader) => {
  if (!file) return;
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = ({ target: { result } }) => resolve(result);
    fr.onerror = (err) => reject(err);
    fr.readAsText(file);
  });
};

export const isSinglePermission = (permission = '') => {
  return (
    permission.startsWith('cluster:') ||
    permission.startsWith('indices:') ||
    permission.startsWith('kibana:') ||
    permission.startsWith('signals:')
  );
};

export const arrayToComboBoxOptions = (array) =>
  sortBy(
    array.map((label) => ({ label })),
    'label'
  );
export const comboBoxOptionsToArray = (array) => sortBy(array.map(({ label }) => label));

export const allowedActionsToPermissionsAndActiongroups = (allowedActions = []) => {
  const { actiongroups, permissions } = reduce(
    allowedActions,
    (result, permission) => {
      if (isSinglePermission(permission)) {
        result.permissions.push(permission);
      } else {
        result.actiongroups.push(permission);
      }
      return result;
    },
    { actiongroups: [], permissions: [] }
  );

  return {
    actiongroups: uniqBy(sortBy(actiongroups)),
    permissions: uniqBy(sortBy(permissions)),
  };
};

export const attributesToUiAttributes = (attributes = {}) =>
  sortBy(map(attributes, (value, key) => ({ value, key })));
export const uiAttributesToAttributes = (attributes = []) =>
  attributes.reduce((result, { key, value }) => {
    if (key.trim() !== '') {
      result[key] = value;
    }
    return result;
  }, {});

export const internalUsersToUiBackendRoles = (internalUsers = {}) => {
  return arrayToComboBoxOptions(
    uniqBy(
      sortBy(
        reduce(
          internalUsers,
          (result, user) => {
            user.backend_roles.forEach((role) => {
              result.push(role);
            });
            return result;
          },
          []
        )
      )
    )
  );
};

export const getAllUiClusterPermissions = () =>
  map(CLUSTER_PERMISSIONS, ({ name }) => ({ label: name }));
export const getAllUiIndexPermissions = () =>
  map(INDEX_PERMISSIONS, ({ name }) => ({ label: name }));

export const filterReservedStaticTableResources = (resources = [], isShowingSystemItems = false) =>
  !isShowingSystemItems
    ? filter(resources, (resource) => !resource.reserved && !resource.static)
    : resources;
