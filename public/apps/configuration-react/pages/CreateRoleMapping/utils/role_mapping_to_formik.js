import { sortBy } from 'lodash';
import { arrayToComboBoxOptions } from '../../../utils/helpers';

const roleMappingToFormik = (roleMapping = {}, id = '') => ({
  _name: id,
  _backendRoles: arrayToComboBoxOptions(sortBy(roleMapping.backend_roles)),
  _hosts: arrayToComboBoxOptions(sortBy(roleMapping.hosts)),
  _users: arrayToComboBoxOptions(sortBy(roleMapping.users)),
  ...roleMapping
});

export default roleMappingToFormik;
