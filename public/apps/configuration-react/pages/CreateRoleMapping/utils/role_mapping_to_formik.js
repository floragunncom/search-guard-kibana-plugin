import { sortBy, filter, map } from 'lodash';
import { arrayToComboBoxOptions } from '../../../utils/helpers';

export const internalUsersToUiInternalUsers = (internalUsers = {}) =>
  arrayToComboBoxOptions(Object.keys(internalUsers));

export const rolesToUiRoles = (roles = {}) => {
  return arrayToComboBoxOptions(filter(map(roles, (role, roleName) => {
    if (!role.reserved) {
      return roleName;
    }
  }), element => element));
};

export const roleMappingToFormik = (roleMapping = {}, id = '') => ({
  _name: [{ label: id }],
  _backendRoles: arrayToComboBoxOptions(sortBy(roleMapping.backend_roles)),
  _hosts: arrayToComboBoxOptions(sortBy(roleMapping.hosts)),
  _users: arrayToComboBoxOptions(sortBy(roleMapping.users)),
  ...roleMapping
});
