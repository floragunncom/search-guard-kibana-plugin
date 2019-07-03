import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  EuiSpacer,
  EuiFlexItem,
  EuiFlexGroup,
  EuiCallOut,
  EuiHorizontalRule
} from '@elastic/eui';
import { FormikRadio, FormikComboBox, TitleSecondary } from '../../../../components';
import { FLS_MODES } from '../../utils/constants';
import {
  fieldLevelSecurityText,
  includeOrExcludeFieldsText,
  anonymizeFieldsText,
  anonymizedFieldsDisabledText
} from '../../../../utils/i18n/roles';
import {
  includeText,
  excludeText
} from '../../../../utils/i18n/common';

const FieldLevelSecurity = ({
  indexPermission,
  index,
  isAnonymizedFieldsEnabled,
  onComboBoxChange,
  onComboBoxOnBlur,
  onComboBoxCreateOption
}) => (
  <Fragment>
    <TitleSecondary text={fieldLevelSecurityText} />
    <EuiHorizontalRule />
    <EuiFlexGroup>
      <EuiFlexItem grow={false}>
        <FormikRadio
          name={`_indexPermissions[${index}].flsmode`}
          formRow
          elementProps={{
            // Radio id must be unique through all accordion items!
            id: `${FLS_MODES.WHITELIST}_${index}`,
            label: includeText,
            checked: indexPermission.flsmode === FLS_MODES.WHITELIST,
            onChange: ({ target: { id } }, field, form) => {
              const flsmode = id.split('_')[0];
              form.setFieldValue(field.name, flsmode);
            }
          }}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <FormikRadio
          name={`_indexPermissions[${index}].flsmode`}
          formRow
          elementProps={{
            // Radio id must be unique through all accordion items!
            id: `${FLS_MODES.BLACKLIST}_${index}`,
            label: excludeText,
            checked: indexPermission.flsmode === FLS_MODES.BLACKLIST,
            onChange: ({ target: { id } }, field, form) => {
              const flsmode = id.split('_')[0];
              form.setFieldValue(field.name, flsmode);
            }
          }}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
    <EuiSpacer size="s"/>

    <FormikComboBox
      name={`_indexPermissions[${index}].fls`}
      formRow
      rowProps={{
        helpText: includeOrExcludeFieldsText
      }}
      elementProps={{
        isClearable: true,
        onBlur: onComboBoxOnBlur,
        onChange: onComboBoxChange(),
        onCreateOption: onComboBoxCreateOption()
      }}
    />
    {!isAnonymizedFieldsEnabled ? (
      <EuiCallOut
        data-test-subj="sgAnonymFieldsDisabledCallout"
        className="sgFixedFormItem"
        iconType="iInCircle"
        title={anonymizedFieldsDisabledText}
      />
    ) : (
      <FormikComboBox
        name={`_indexPermissions[${index}].masked_fields`}
        formRow
        rowProps={{
          helpText: anonymizeFieldsText
        }}
        elementProps={{
          isClearable: true,
          onBlur: onComboBoxOnBlur,
          onChange: onComboBoxChange(),
          onCreateOption: onComboBoxCreateOption()
        }}
      />
    )}
  </Fragment>
);

FieldLevelSecurity.propTypes = {
  index: PropTypes.number.isRequired,
  indexPermission: PropTypes.object.isRequired,
  isAnonymizedFieldsEnabled: PropTypes.bool.isRequired,
  onComboBoxChange: PropTypes.func.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired
};

export default FieldLevelSecurity;
