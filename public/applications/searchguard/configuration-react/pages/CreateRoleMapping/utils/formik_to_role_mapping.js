import { cloneDeep, omit } from 'lodash';
import { comboBoxOptionsToArray } from '../../../utils/helpers';
import { FIELDS_TO_OMIT_BEFORE_SAVE } from '../../../utils/constants';

const formikToRoleMapping = _formik => {
  const formik = cloneDeep(_formik);
  const { _backendRoles, _hosts, _users, _ips } = formik;
  return {
    ...omit(formik, [
      '_name',
      '_backendRoles',
      '_hosts',
      '_ips',
      '_users',
      'and_backend_roles',
      ...FIELDS_TO_OMIT_BEFORE_SAVE
    ]),
    backend_roles: comboBoxOptionsToArray(_backendRoles),
    hosts: comboBoxOptionsToArray(_hosts),
    ips: comboBoxOptionsToArray(_ips),
    users: comboBoxOptionsToArray(_users)
  };
};

export default formikToRoleMapping;
