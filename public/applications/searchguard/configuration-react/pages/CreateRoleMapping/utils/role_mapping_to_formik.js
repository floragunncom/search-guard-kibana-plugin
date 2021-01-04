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

import { sortBy, difference, forEach } from 'lodash';
import { arrayToComboBoxOptions } from '../../../utils/helpers';

export const internalUsersToUiInternalUsers = (internalUsers = {}) =>
  arrayToComboBoxOptions(Object.keys(internalUsers));

export const rolesToUiRoles = (allRoles = {}, allRoleMappings = {}) => {
  const diff = difference(Object.keys(allRoles), Object.keys(allRoleMappings));
  const availableGroup = {
    label: 'Available',
    options: [],
  };
  const occupiedGroup = {
    label: 'Occupied',
    options: [],
  };

  forEach(allRoles, (value, label) => {
    const isOccupied = !diff.includes(label);
    if (isOccupied) {
      occupiedGroup.options.push({ label, disabled: isOccupied, color: 'subdued' });
    } else {
      availableGroup.options.push({ label, disabled: isOccupied, color: 'default' });
    }
  });

  return [
    { ...availableGroup, options: sortBy(availableGroup.options, 'label') },
    { ...occupiedGroup, options: sortBy(occupiedGroup.options, 'label') },
  ];
};

export const roleMappingToFormik = (roleMapping = {}, label) => {
  const formik = {
    ...roleMapping,
    _backendRoles: arrayToComboBoxOptions(roleMapping.backend_roles),
    _hosts: arrayToComboBoxOptions(roleMapping.hosts),
    _users: arrayToComboBoxOptions(roleMapping.users),
  };

  if (label) formik._name = [{ label }];
  return formik;
};
