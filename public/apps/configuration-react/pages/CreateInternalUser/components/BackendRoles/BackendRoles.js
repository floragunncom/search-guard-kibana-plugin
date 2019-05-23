import React from 'react';
import PropTypes from 'prop-types';
import { FormikComboBox } from '../../../../components';
import { backendRolesText } from '../../../../utils/i18n/internal_users';

const BackendRoles = ({ allRoles, onComboBoxChange, onComboBoxOnBlur }) => (
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
      onChange: onComboBoxChange
    }}
  />
);

BackendRoles.propTypes = {
  allRoles: PropTypes.array.isRequired,
  onComboBoxChange: PropTypes.func.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired
};

export default BackendRoles;
