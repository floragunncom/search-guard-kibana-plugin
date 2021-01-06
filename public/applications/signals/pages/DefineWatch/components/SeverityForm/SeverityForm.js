/* eslint-disable @kbn/eslint/require-license-header */
import React, { useContext } from 'react';
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
import {
  EuiText,
  EuiTextColor,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiErrorBoundary,
} from '@elastic/eui';
import {
  SubHeader,
  FormikFieldText,
  FormikFieldNumber,
  FormikSelect,
  FormikComboBox,
} from '../../../../../components';
import {
  severityText,
  leaveInputEmptyToOmitThresholdLevelText,
} from '../../../../utils/i18n/watch';
import {
  fieldText,
  orderText,
  infoText,
  warningText,
  errorText,
  criticalText,
} from '../../../../utils/i18n/common';
import { SEVERITY } from '../../utils/constants';
import { SEVERITY_OPTIONS } from './utils/constants';
import {
  isInvalid,
  hasError,
  validateEmptyField,
  validateEmptyComboBox,
} from '../../../../utils/validate';
import { validateSeverityThresholds } from './utils/validateSeverityThresholds';

import { Context } from '../../../../Context';

const Field = ({ fields = [] }) => {
  const { onComboBoxChange } = useContext(Context);

  if (!fields.length) {
    return (
      <FormikFieldText
        name="_ui.severity.valueString"
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
          validate: validateEmptyField,
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
        isInvalid,
        error: hasError,
      }}
      elementProps={{
        placeholder: 'Select a field',
        options: fields,
        onChange: onComboBoxChange(validateEmptyComboBox),
        isClearable: false,
        singleSelection: { asPlainText: true },
        'data-test-subj': 'sgSeverityFieldComboBox',
      }}
      formikFieldProps={{
        validate: validateEmptyComboBox,
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

const InfoThreshold = ({ thresholdErrors }) => (
  <FormikFieldNumber
    name="_ui.severity.thresholds.info"
    formRow
    rowProps={{
      label: infoText,
      isInvalid: thresholdErrors.indexOf(SEVERITY.INFO) > -1,
    }}
    elementProps={{
      isInvalid: thresholdErrors.indexOf(SEVERITY.INFO) > -1,
    }}
  />
);

const WarningThreshold = ({ thresholdErrors }) => (
  <FormikFieldNumber
    name="_ui.severity.thresholds.warning"
    formRow
    rowProps={{
      label: warningText,
      isInvalid: thresholdErrors.indexOf(SEVERITY.WARNING) > -1,
    }}
    elementProps={{
      isInvalid: thresholdErrors.indexOf(SEVERITY.WARNING) > -1,
    }}
  />
);

const ErrorThreshold = ({ thresholdErrors }) => (
  <FormikFieldNumber
    name="_ui.severity.thresholds.error"
    formRow
    rowProps={{
      label: errorText,
      isInvalid: thresholdErrors.indexOf(SEVERITY.ERROR) > -1,
    }}
    elementProps={{
      isInvalid: thresholdErrors.indexOf(SEVERITY.ERROR) > -1,
    }}
  />
);

const CriticalThreshold = ({ thresholdErrors }) => (
  <FormikFieldNumber
    name="_ui.severity.thresholds.critical"
    formRow
    rowProps={{
      label: criticalText,
      isInvalid: thresholdErrors.indexOf(SEVERITY.CRITICAL) > -1,
    }}
    elementProps={{
      isInvalid: thresholdErrors.indexOf(SEVERITY.CRITICAL) > -1,
    }}
  />
);

const SeverityForm = ({ isCompressed, isTitle, fields, formik: { values } }) => {
  const thresholdValidation = validateSeverityThresholds(
    values._ui.severity.order,
    values._ui.severity.thresholds
  );
  const containerStyle = isCompressed ? { maxWidth: '550px' } : {};

  return (
    <EuiErrorBoundary>
      <div style={containerStyle}>
        {isTitle && (
          <>
            <SubHeader title={<h4>{severityText}</h4>} />
            <EuiSpacer size="m" />
          </>
        )}

        {isCompressed ? (
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem>
              <Field fields={fields} />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <Order />
            </EuiFlexItem>
          </EuiFlexGroup>
        ) : (
          <>
            <Field fields={fields} />
            <Order />
            <EuiSpacer size="m" />
          </>
        )}

        <EuiFlexGroup>
          <EuiFlexItem grow={false}>
            <InfoThreshold thresholdErrors={thresholdValidation.thresholdErrors} />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <WarningThreshold thresholdErrors={thresholdValidation.thresholdErrors} />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <ErrorThreshold thresholdErrors={thresholdValidation.thresholdErrors} />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <CriticalThreshold thresholdErrors={thresholdValidation.thresholdErrors} />
          </EuiFlexItem>
        </EuiFlexGroup>

        {thresholdValidation.message && (
          <>
            <EuiSpacer size="xs" />
            <EuiText size="xs" color="danger">
              {thresholdValidation.message}
            </EuiText>
          </>
        )}

        <EuiSpacer size="xs" />
        <EuiText size="xs">
          <EuiTextColor color="subdued">{leaveInputEmptyToOmitThresholdLevelText}</EuiTextColor>
        </EuiText>
      </div>
    </EuiErrorBoundary>
  );
};

SeverityForm.defaultProps = {
  fields: [],
  isCompressed: false,
  isTitle: false,
};

SeverityForm.propTypes = {
  fields: PropTypes.array,
  isCompressed: PropTypes.bool,
  isTitle: PropTypes.bool,
};

export default connectFormik(SeverityForm);
