import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormikComboBox, FormikSwitch } from '../../../../components';
import { actionGroupsText, singlePermissionsText } from '../../../../utils/i18n/action_groups';
import { advancedText } from '../../../../utils/i18n/common';

const ClusterPermissions = ({
  allActionGroups,
  allSinglePermissions,
  isAdvanced,
  onComboBoxChange,
  onComboBoxOnBlur
}) => (
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
        onChange: onComboBoxChange
      }}
    />
    <FormikSwitch
      formRow
      elementProps={{
        label: advancedText
      }}
      name="_isClusterPermissionsAdvanced"
    />
    {isAdvanced &&
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
          onChange: onComboBoxChange
        }}
      />
    }
  </Fragment>
);

ClusterPermissions.propTypes = {
  allActionGroups: PropTypes.array.isRequired,
  allSinglePermissions: PropTypes.array.isRequired,
  isAdvanced: PropTypes.bool.isRequired,
  onComboBoxChange: PropTypes.func.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired
};

export default ClusterPermissions;
