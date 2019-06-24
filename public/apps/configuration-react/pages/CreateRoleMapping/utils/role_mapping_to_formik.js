import { sortBy } from 'lodash';
import { arrayToComboBoxOptions } from '../../../utils/helpers';

export const internalUsersToUiInternalUsers = (internalUsers = {}) =>
  arrayToComboBoxOptions(Object.keys(internalUsers));

export const rolesToUiRoles = (roles = {}) => arrayToComboBoxOptions(sortBy(Object.keys(roles)));

export const roleMappingToFormik = (roleMapping = {}, label) => {
  const formik = {
    ...roleMapping,
    _backendRoles: arrayToComboBoxOptions(sortBy(roleMapping.backend_roles)),
    _hosts: arrayToComboBoxOptions(sortBy(roleMapping.hosts)),
    _users: arrayToComboBoxOptions(sortBy(roleMapping.users))
  };

  if (label) formik._name = [{ label }];
  return formik;
};
