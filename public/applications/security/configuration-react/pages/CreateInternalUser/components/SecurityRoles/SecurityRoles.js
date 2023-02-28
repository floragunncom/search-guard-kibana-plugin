/*
 * Copyright 2023 Excelerate Technology Limited T/A Eliatra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * *    Copyright 2020 floragunn GmbH
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
import { FormikComboBox } from '../../../../components';
import { internalRolesText } from '../../../../utils/i18n/internal_users';
import { Context } from '../../../../Context';

const SecurityRoles = ({ allSecurityRoles }) => {
  const { onComboBoxChange, onComboBoxOnBlur, onComboBoxCreateOption } = useContext(Context);

  return (
    <FormikComboBox
      name="_internalRoles"
      formRow
      rowProps={{
        label: internalRolesText,
      }}
      elementProps={{
        options: allSecurityRoles,
        isClearable: true,
        onBlur: onComboBoxOnBlur,
        onChange: onComboBoxChange(),
        onCreateOption: onComboBoxCreateOption(),
      }}
    />
  );
};

SecurityRoles.propTypes = {
  allSecurityRoles: PropTypes.array.isRequired,
};

export default SecurityRoles;
