import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormikComboBox, FormikSwitch } from '../../../../components';
import { actionGroupsText, singlePermissionsText } from '../../../../utils/i18n/action_groups';
import { advancedText } from '../../../../utils/i18n/common';

const ClusterPermissions = ({ allActionGroups, allSinglePermissions, isAdvanced }) => (
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
        onBlur: (e, field, form) => {
          form.setFieldTouched('_clusterPermissions.actiongroups', true);
        },
        onChange: (options, field, form) => {
          form.setFieldValue('_clusterPermissions.actiongroups', options);
        }
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
          onBlur: (e, field, form) => {
            form.setFieldTouched('_clusterPermissions.permissions', true);
          },
          onChange: (options, field, form) => {
            form.setFieldValue('_clusterPermissions.permissions', options);
          }
        }}
      />
    }
  </Fragment>
);

ClusterPermissions.propTypes = {
  allActionGroups: PropTypes.array.isRequired,
  allSinglePermissions: PropTypes.array.isRequired,
  isAdvanced: PropTypes.bool.isRequired
};

export default ClusterPermissions;
