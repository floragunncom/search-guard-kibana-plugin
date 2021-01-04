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

import { cloneDeep, omit } from 'lodash';
import { comboBoxOptionsToArray } from '../../../utils/helpers';
import { FIELDS_TO_OMIT_BEFORE_SAVE } from '../../../utils/constants';

const formikToRoleMapping = (_formik) => {
  const formik = cloneDeep(_formik);
  const { _backendRoles, _hosts, _users } = formik;
  return {
    ...omit(formik, [
      '_name',
      '_backendRoles',
      '_hosts',
      '_users',
      'and_backend_roles',
      ...FIELDS_TO_OMIT_BEFORE_SAVE,
    ]),
    backend_roles: comboBoxOptionsToArray(_backendRoles),
    hosts: comboBoxOptionsToArray(_hosts),
    users: comboBoxOptionsToArray(_users),
  };
};

export default formikToRoleMapping;
