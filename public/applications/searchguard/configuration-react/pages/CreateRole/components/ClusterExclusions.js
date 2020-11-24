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

import React, { Fragment, useContext } from 'react';
import PropTypes from 'prop-types';
import { FormikComboBox, FormikSwitch } from '../../../components';
import { actionGroupsText, singleExclusionsText } from '../../../utils/i18n/action_groups';
import { advancedText } from '../../../utils/i18n/common';
import { validSinglePermissionOption } from '../../../utils/validation';

import { Context } from '../../../Context';

export function ClusterExclusions({ allActionGroups, allSinglePermissions, values }) {
  const { onSwitchChange, onComboBoxChange, onComboBoxCreateOption, onComboBoxOnBlur } = useContext(
    Context
  );

  return (
    <Fragment>
      <FormikComboBox
        name="_excludeClusterPermissions.actiongroups"
        formRow
        rowProps={{
          label: actionGroupsText,
        }}
        elementProps={{
          options: allActionGroups,
          isClearable: true,
          onBlur: onComboBoxOnBlur,
          onChange: onComboBoxChange(),
        }}
      />
      <FormikSwitch
        formRow
        elementProps={{
          label: advancedText,
          onChange: onSwitchChange,
        }}
        name="_isClusterExclusionsAdvanced"
      />
      {values._isClusterExclusionsAdvanced && (
        <FormikComboBox
          name="_excludeClusterPermissions.permissions"
          formRow
          rowProps={{
            label: singleExclusionsText,
          }}
          elementProps={{
            options: allSinglePermissions,
            isClearable: true,
            onBlur: onComboBoxOnBlur,
            onCreateOption: onComboBoxCreateOption(validSinglePermissionOption),
            onChange: onComboBoxChange(),
          }}
        />
      )}
    </Fragment>
  );
}

ClusterExclusions.propTypes = {
  allActionGroups: PropTypes.array.isRequired,
  allSinglePermissions: PropTypes.array.isRequired,
  values: PropTypes.shape({
    _isClusterExclusionsAdvanced: PropTypes.bool.isRequired,
  }).isRequired,
};
