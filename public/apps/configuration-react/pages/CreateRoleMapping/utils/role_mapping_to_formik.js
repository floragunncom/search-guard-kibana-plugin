import { sortBy } from 'lodash';
import { arrayToComboBoxOptions } from '../../../utils/helpers';

export const internalUsersToUiInternalUsers = (internalUsers = {}) =>
  arrayToComboBoxOptions(Object.keys(internalUsers));

export const rolesToUiRoles = (roles = {}) => arrayToComboBoxOptions(sortBy(Object.keys(roles)));

export const roleMappingToFormik = (roleMapping = {}, id = { label: '' }) => {
  return {
    ...roleMapping,
    _name: [id],
    _backendRoles: arrayToComboBoxOptions(sortBy(roleMapping.backend_roles)),
    _hosts: arrayToComboBoxOptions(sortBy(roleMapping.hosts)),
    _users: arrayToComboBoxOptions(sortBy(roleMapping.users))
  };
};
