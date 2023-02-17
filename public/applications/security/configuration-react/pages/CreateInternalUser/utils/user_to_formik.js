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

import { omit } from 'lodash';
import { arrayToComboBoxOptions, attributesToUiAttributes } from '../../../utils/helpers';
import { isComplexAttributes } from './is_complex_attributes';

const userToFormik = (user, { id = '' } = {}) => {

  const formik = {
    ...omit(user, ['hash']),
    _username: id,
    _password: '',
    _internalRoles: arrayToComboBoxOptions(user.internal_roles),
    _backendRoles: arrayToComboBoxOptions(user.backend_roles),
    _changePassword: false,
    _attributes: [],
    _attributesString: JSON.stringify(user.attributes, null, 2),
    _isComplexUserAttributes: false,
    _isAdvanced: user.backend_roles != null && user.backend_roles.length ? true : false,
  };

  if (isComplexAttributes(user.attributes)) {
    formik._isComplexUserAttributes = true;
  } else {
    formik._attributes = attributesToUiAttributes(user.attributes);
  }

  return formik;
};

export default userToFormik;
