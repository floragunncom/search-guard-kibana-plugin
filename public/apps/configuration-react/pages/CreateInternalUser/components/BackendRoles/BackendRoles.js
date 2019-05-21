import React from 'react';
import PropTypes from 'prop-types';
import { FormikComboBox } from '../../../../components';
import { backendRolesText } from '../../../../utils/i18n/internal_users';

const BackendRoles = ({ allRoles }) => (
  <FormikComboBox
    name="_backendRoles"
    formRow
    rowProps={{
      label: backendRolesText,
    }}
    elementProps={{
      options: allRoles,
      isClearable: true,
      onBlur: (e, field, form) => {
        form.setFieldTouched('_backendRoles', true);
      },
      onChange: (options, field, form) => {
        form.setFieldValue('_backendRoles', options);
      }
    }}
  />
);

BackendRoles.propTypes = {
  allRoles: PropTypes.array.isRequired
};

export default BackendRoles;
