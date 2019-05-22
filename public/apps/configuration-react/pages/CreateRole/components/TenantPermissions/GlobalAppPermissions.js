import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { EuiSpacer, EuiTitle } from '@elastic/eui';
import { FormikComboBox } from '../../../../components';
import { actionGroupsText } from '../../../../utils/i18n/action_groups';
import { globalAppPermissionsText } from '../../../../utils/i18n/roles';

const GlobalAppPermissions = ({ allAppActionGroups }) => (
  <Fragment>
    <EuiTitle size="xs"><h4>{globalAppPermissionsText}</h4></EuiTitle>
    <EuiSpacer size="s" />

    <FormikComboBox
      name="_globalApplicationPermissions"
      formRow
      rowProps={{
        label: actionGroupsText,
      }}
      elementProps={{
        options: allAppActionGroups,
        isClearable: true,
        onBlur: (e, field, form) => {
          form.setFieldTouched('_globalApplicationPermissions', true);
        },
        onChange: (options, field, form) => {
          form.setFieldValue('_globalApplicationPermissions', options);
        }
      }}
    />
  </Fragment>
);

GlobalAppPermissions.propTypes = {
  allAppActionGroups: PropTypes.array.isRequired
};

export default GlobalAppPermissions;
