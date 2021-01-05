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

import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { FormikComboBox, LabelAppendLink } from '../../../../components';
import {
  searchGuardRolesText,
  addRolesToConfigureAccessPermissionText,
} from '../../../../utils/i18n/internal_users';
import { Context } from '../../../../Context';
import { DOC_LINKS } from '../../../../utils/constants';

const SearchGuardRoles = ({ allSearchGuardRoles }) => {
  const { onComboBoxChange, onComboBoxOnBlur, onComboBoxCreateOption } = useContext(Context);

  return (
    <FormikComboBox
      name="_searchGuardRoles"
      formRow
      rowProps={{
        label: searchGuardRolesText,
        labelAppend: <LabelAppendLink name="searchGuardRoles" href={DOC_LINKS.ROLE_PERMISSIONS} />,
        helpText: addRolesToConfigureAccessPermissionText,
      }}
      elementProps={{
        options: allSearchGuardRoles,
        isClearable: true,
        onBlur: onComboBoxOnBlur,
        onChange: onComboBoxChange(),
        onCreateOption: onComboBoxCreateOption(),
      }}
    />
  );
};

SearchGuardRoles.propTypes = {
  allSearchGuardRoles: PropTypes.array.isRequired,
};

export default SearchGuardRoles;
