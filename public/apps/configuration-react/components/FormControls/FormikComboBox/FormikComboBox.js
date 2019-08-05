import React from 'react';
import PropTypes from 'prop-types';
import { EuiComboBox, EuiErrorBoundary } from '@elastic/eui';
import FormikInputWrapper from '../FormikInputWrapper';
import FormikFormRow from '../FormikFormRow';

const ComboBox = ({
  name,
  form,
  field,
  elementProps: { onBlur, onChange, onCreateOption, ...props },
}) => (
  <EuiComboBox
    name={name}
    id={name}
    onChange={onChange instanceof Function ? options => onChange(options, field, form) : onChange}
    onCreateOption={onCreateOption instanceof Function ? value => onCreateOption(value, field, form) : onCreateOption}
    onBlur={onBlur instanceof Function ? e => onBlur(e, field, form) : onBlur}
    selectedOptions={field.value}
    {...props}
  />
);

ComboBox.propTypes = {
  name: PropTypes.string.isRequired,
  elementProps: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  field: PropTypes.object.isRequired,
};

const FormikComboBox = ({
  name,
  formRow = false,
  formikFieldProps = {},
  rowProps = {},
  elementProps = {},
}) => (
  <EuiErrorBoundary>
    <FormikInputWrapper
      name={name}
      formikFieldProps={formikFieldProps}
      render={({ field, form }) => {
        const comboBox = (<ComboBox name={name} form={form} field={field} elementProps={elementProps} />);
        return !formRow ? comboBox : (
          <FormikFormRow name={name} form={form} rowProps={rowProps}>{comboBox}</FormikFormRow>
        );
      }}
    />
  </EuiErrorBoundary>
);

FormikComboBox.propTypes = {
  name: PropTypes.string.isRequired,
  formRow: PropTypes.bool,
  formikFieldProps: PropTypes.object,
  rowProps: PropTypes.object,
  elementProps: PropTypes.object,
};

export default FormikComboBox;
