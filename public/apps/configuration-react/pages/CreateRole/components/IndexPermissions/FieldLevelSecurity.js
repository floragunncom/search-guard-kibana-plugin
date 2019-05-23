import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  EuiTitle,
  EuiSpacer,
  EuiFlexItem,
  EuiFlexGroup
} from '@elastic/eui';
import { FormikRadio, FormikComboBox } from '../../../../components';
import { FLS_MODES } from '../../utils/constants';
import {
  fieldLevelSecurityText,
  includeOrExcludeFieldsText,
  anonymizeFieldsText
} from '../../../../utils/i18n/roles';

const FieldLevelSecurity = ({
  indexPermission,
  index,
  onComboBoxChange,
  onComboBoxOnBlur,
  onComboBoxCreateOption
}) => (
  <Fragment>
    <EuiTitle size="xs"><h4>{fieldLevelSecurityText}</h4></EuiTitle>

    <EuiSpacer size="s"/>

    <EuiFlexGroup>
      <EuiFlexItem grow={false}>
        <FormikRadio
          name={`_indexPermissions[${index}].flsmode`}
          formRow
          elementProps={{
            id: FLS_MODES[0].id,
            label: FLS_MODES[0].label,
            checked: indexPermission.flsmode === FLS_MODES[0].id,
            onChange: ({ target: { id } }, field, form) => {
              form.setFieldValue(`_indexPermissions[${index}].flsmode`, id);
            }
          }}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <FormikRadio
          name={`_indexPermissions[${index}].flsmode`}
          formRow
          elementProps={{
            id: FLS_MODES[1].id,
            label: FLS_MODES[1].label,
            checked: indexPermission.flsmode === FLS_MODES[1].id,
            onChange: ({ target: { id } }, field, form) => {
              form.setFieldValue(`_indexPermissions[${index}].flsmode`, id);
            }
          }}
        />
      </EuiFlexItem>
    </EuiFlexGroup>

    <EuiSpacer size="s"/>

    <EuiFlexGroup>
      <EuiFlexItem>
        <FormikComboBox
          name={`_indexPermissions[${index}].fls`}
          formRow
          rowProps={{
            helpText: includeOrExcludeFieldsText
          }}
          elementProps={{
            isClearable: true,
            onBlur: onComboBoxOnBlur,
            onChange: onComboBoxChange,
            onCreateOption: onComboBoxCreateOption
          }}
        />
      </EuiFlexItem>

      <EuiFlexItem>
        <FormikComboBox
          name={`_indexPermissions[${index}].masked_fields`}
          formRow
          rowProps={{
            helpText: anonymizeFieldsText
          }}
          elementProps={{
            isClearable: true,
            onBlur: onComboBoxOnBlur,
            onChange: onComboBoxChange,
            onCreateOption: onComboBoxCreateOption
          }}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  </Fragment>
);

FieldLevelSecurity.propTypes = {
  index: PropTypes.number.isRequired,
  indexPermission: PropTypes.object.isRequired,
  onComboBoxChange: PropTypes.func.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired
};

export default FieldLevelSecurity;
