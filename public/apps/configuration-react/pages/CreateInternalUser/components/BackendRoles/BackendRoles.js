import React from 'react';
import PropTypes from 'prop-types';
import { FormikComboBox } from '../../../../components';
import { backendRolesText } from '../../../../utils/i18n/internalusers';

const BackendRoles = ({ allRoles }) => (
  <FormikComboBox
    name="backend_roles"
    formRow
    rowProps={{
      label: backendRolesText,
    }}
    elementProps={{
      options: allRoles,
      isClearable: true,
      onBlur: (e, field, form) => {
        form.setFieldTouched('backend_roles', true);
      },
      onChange: (options, field, form) => {
        form.setFieldValue('backend_roles', options);
      },
      onCreateOption: (label, field, form) => {
        const normalizedSearchValue = label.trim().toLowerCase();
        if (!normalizedSearchValue) return;
        form.setFieldValue('backend_roles', field.value.concat({ label }));
      },
    }}
  />
);

BackendRoles.propTypes = {
  allRoles: PropTypes.array.isRequired
};

export default BackendRoles;
