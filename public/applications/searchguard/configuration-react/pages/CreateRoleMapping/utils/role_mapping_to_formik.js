import { sortBy, difference, forEach } from 'lodash';
import { arrayToComboBoxOptions } from '../../../utils/helpers';

export const internalUsersToUiInternalUsers = (internalUsers = {}) =>
  arrayToComboBoxOptions(Object.keys(internalUsers));

export const rolesToUiRoles = (allRoles = {}, allRoleMappings = {}) => {
  const diff = difference(Object.keys(allRoles), Object.keys(allRoleMappings));
  const availableGroup = {
    label: 'Available',
    options: []
  };
  const occupiedGroup = {
    label: 'Occupied',
    options: []
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
    { ...occupiedGroup, options: sortBy(occupiedGroup.options, 'label') }
  ];
};

export const roleMappingToFormik = (roleMapping = {}, label) => {
  const formik = {
    ...roleMapping,
    _backendRoles: arrayToComboBoxOptions(roleMapping.backend_roles),
    _hosts: arrayToComboBoxOptions(roleMapping.hosts),
    _users: arrayToComboBoxOptions(roleMapping.users)
  };

  if (label) formik._name = [{ label }];
  return formik;
};
