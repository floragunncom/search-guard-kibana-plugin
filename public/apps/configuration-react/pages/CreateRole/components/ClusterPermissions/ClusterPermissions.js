/* eslint-disable @kbn/eslint/require-license-header */
import React, { Fragment, useContext } from 'react';
import PropTypes from 'prop-types';
import { FormikComboBox, FormikSwitch } from '../../../../components';
import { actionGroupsText, singlePermissionsText } from '../../../../utils/i18n/action_groups';
import { advancedText } from '../../../../utils/i18n/common';
import { validSinglePermissionOption } from '../../../../utils/validation';

import { Context } from '../../../../Context';

const ClusterPermissions = ({ allActionGroups, allSinglePermissions, isAdvanced }) => {
  const { onSwitchChange, onComboBoxChange, onComboBoxCreateOption, onComboBoxOnBlur } = useContext(
    Context
  );

  return (
    <Fragment>
      <FormikComboBox
        name="_clusterPermissions.actiongroups"
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
        name="_isClusterPermissionsAdvanced"
      />
      {isAdvanced && (
        <FormikComboBox
          name="_clusterPermissions.permissions"
          formRow
          rowProps={{
            label: singlePermissionsText,
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
};

ClusterPermissions.propTypes = {
  allActionGroups: PropTypes.array.isRequired,
  allSinglePermissions: PropTypes.array.isRequired,
  isAdvanced: PropTypes.bool.isRequired,
};

export default ClusterPermissions;