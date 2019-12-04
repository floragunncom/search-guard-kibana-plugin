import React from 'react';
import PropTypes from 'prop-types';
import {
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem
} from '@elastic/eui';
import {
  SubHeader,
  FormikFieldText,
  FormikFieldNumber,
  FormikSelect,
  FormikComboBox
} from '../../../../../components';
import { severityText } from '../../../../utils/i18n/watch';
import {
  fieldText,
  orderText,
  infoText,
  warningText,
  errorText,
  criticalText
} from '../../../../utils/i18n/common';
import { SEVERITY_OPTIONS } from './utils/constants';
import { isInvalid, hasError, validateEmptyField } from '../../../../utils/validate';

const Field = ({ fields = [] }) => {
  if (!fields.length) {
    return (
      <FormikFieldText
        name="_ui.severity.value[0].label"
        formRow
        rowProps={{
          label: fieldText,
          isInvalid,
          error: hasError,
        }}
        elementProps={{
          isInvalid,
          onFocus: (e, field, form) => {
            form.setFieldError(field.name, undefined);
          },
        }}
        formikFieldProps={{
          placeholder: 'A field with number',
          validate: validateEmptyField
        }}
      />
    );
  }

  // For graph mode only
  return (
    <FormikComboBox
      name="_ui.severity.value"
      formRow
      rowProps={{
        label: fieldText,
      }}
      elementProps={{
        placeholder: 'Select a field',
        options: fields,
        onChange: (options, field, form) => {
          form.setFieldValue(field.name, options);
        },
        isClearable: false,
        singleSelection: { asPlainText: true },
        'data-test-subj': 'sgSeverityFieldComboBox',
      }}
    />
  );
};

const Order = () => (
  <FormikSelect
    name="_ui.severity.order"
    formRow
    rowProps={{
      label: orderText,
    }}
    elementProps={{
      options: SEVERITY_OPTIONS,
    }}
  />
);

const InfoThreshold = () => (
  <FormikFieldNumber
    name="_ui.severity.thresholds.info"
    formRow
    rowProps={{
      label: infoText,
    }}
  />
);

const WarningThreshold = () => (
  <FormikFieldNumber
    name="_ui.severity.thresholds.warning"
    formRow
    rowProps={{
      label: warningText,
    }}
  />
);

const ErrorThreshold = () => (
  <FormikFieldNumber
    name="_ui.severity.thresholds.error"
    formRow
    rowProps={{
      label: errorText,
    }}
  />
);

const CriticalThreshold = () => (
  <FormikFieldNumber
    name="_ui.severity.thresholds.critical"
    formRow
    rowProps={{
      label: criticalText,
    }}
  />
);

const SeverityForm = ({ isCompressed, isTitle, fields }) => {
  const fieldFlexItemProps = {};

  const flexItemProps = !isCompressed ? {} : {
    style: { width: 100 },
    grow: false
  };

  const flexGroupProps = !isCompressed ? {} : {
    style: { maxWidth: 600 }
  };

  return (
    <>
      {isTitle && (
        <>
          <SubHeader title={<h4>{severityText}</h4>} />
          <EuiSpacer size="m" />
        </>
      )}
      <EuiFlexGroup {...flexGroupProps}>
        <EuiFlexItem {...fieldFlexItemProps}>
          <Field fields={fields} />
        </EuiFlexItem>
        <EuiFlexItem {...flexItemProps}>
          <Order />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup {...flexGroupProps}>
        <EuiFlexItem {...flexItemProps}>
          <InfoThreshold />
        </EuiFlexItem>
        <EuiFlexItem {...flexItemProps}>
          <WarningThreshold />
        </EuiFlexItem>
        <EuiFlexItem {...flexItemProps}>
          <ErrorThreshold />
        </EuiFlexItem>
        <EuiFlexItem {...flexItemProps}>
          <CriticalThreshold />
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};

SeverityForm.defaultProps = {
  fields: [],
  isCompressed: false,
  isTitle: false
};

SeverityForm.propTypes = {
  fields: PropTypes.array,
  isCompressed: PropTypes.bool,
  isTitle: PropTypes.bool,
};

export default SeverityForm;
