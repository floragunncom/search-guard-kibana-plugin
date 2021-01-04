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

import React from 'react';
import PropTypes from 'prop-types';
import { FormikComboBox } from '../../../../components';
import { backendRolesText } from '../../../../utils/i18n/internal_users';

const BackendRoles = ({ allRoles, onComboBoxChange, onComboBoxOnBlur, onComboBoxCreateOption }) => (
  <FormikComboBox
    name="_backendRoles"
    formRow
    rowProps={{
      label: backendRolesText,
    }}
    elementProps={{
      options: allRoles,
      isClearable: true,
      onBlur: onComboBoxOnBlur,
      onChange: onComboBoxChange(),
      onCreateOption: onComboBoxCreateOption(),
    }}
  />
);

BackendRoles.propTypes = {
  allRoles: PropTypes.array.isRequired,
  onComboBoxChange: PropTypes.func.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired,
};

export default BackendRoles;
