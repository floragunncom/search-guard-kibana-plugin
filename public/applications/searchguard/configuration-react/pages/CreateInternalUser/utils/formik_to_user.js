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
import { uiAttributesToAttributes, comboBoxOptionsToArray } from '../../../utils/helpers';
import { FIELDS_TO_OMIT_BEFORE_SAVE } from '../../../utils/constants';

const formikToUser = (userFormik) => {
  const user = {
    ...omit(userFormik, [
      '_username',
      '_password',
      '_passwordConfirmation',
      '_changePassword',
      '_searchGuardRoles',
      '_backendRoles',
      '_attributes',
      '_attributesString',
      '_isComplexUserAttributes',
      '_isAdvanced',
      ...FIELDS_TO_OMIT_BEFORE_SAVE,
    ]),
    search_guard_roles: comboBoxOptionsToArray(userFormik._searchGuardRoles),
    backend_roles: comboBoxOptionsToArray(userFormik._backendRoles),
  };

  if (userFormik._isComplexUserAttributes) {
    user.attributes = JSON.parse(userFormik._attributesString);
  } else {
    user.attributes = uiAttributesToAttributes(userFormik._attributes);
  }

  if (userFormik._password) {
    user.password = userFormik._password;
  }

  // The logic below is from the old app.
  if (user.hidden === false) delete user.hidden;
  if (user.reserved === false) delete user.reserved;

  return user;
};

export default formikToUser;
