import { cloneDeep, omit } from 'lodash';
import { comboBoxOptionsToArray } from '../../../utils/helpers';

const formikToRoleMapping = _formik => {
  const formik = cloneDeep(_formik);
  const { _backendRoles, _hosts, _users } = formik;
  return {
    ...omit(formik, ['_name', '_backendRoles', '_hosts', '_users']),
    backend_roles: comboBoxOptionsToArray(_backendRoles),
    hosts: comboBoxOptionsToArray(_hosts),
    users: comboBoxOptionsToArray(_users)
  };
};

export default formikToRoleMapping;
