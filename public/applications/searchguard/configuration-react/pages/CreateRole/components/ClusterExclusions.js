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
import { FormikComboBox, FormikSwitch, LabelAppendLink } from '../../../components';
import { ActionGroupsHelpText } from './common';
import { actionGroupsText, singleExclusionsText } from '../../../utils/i18n/action_groups';
import { advancedText, allowDisallowActionsBasedOnTheLevelsText } from '../../../utils/i18n/common';
import { validSinglePermissionOption, isInvalid, hasError } from '../../../utils/validation';
import { DOC_LINKS } from '../../../utils/constants';
import { Context } from '../../../Context';

export function ClusterExclusions({ allActionGroups, allSinglePermissions, values, history }) {
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
          labelAppend: (
            <LabelAppendLink name="searchGuardActionGroups" href={DOC_LINKS.ACTION_GROUPS} />
          ),
          helpText: <ActionGroupsHelpText history={history} />,
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
            isInvalid,
            error: hasError,
            helpText: allowDisallowActionsBasedOnTheLevelsText,
          }}
          elementProps={{
            isInvalid,
            options: allSinglePermissions,
            isClearable: true,
            onBlur: onComboBoxOnBlur,
            onCreateOption: onComboBoxCreateOption(),
            onChange: onComboBoxChange(),
          }}
          formikFieldProps={{
            validate: validSinglePermissionOption,
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
  history: PropTypes.object.isRequired,
};
