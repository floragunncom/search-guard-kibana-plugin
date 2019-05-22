import React from 'react';
import PropTypes from 'prop-types';
import { EuiRadio } from '@elastic/eui';
import FormikInputWrapper from '../FormikInputWrapper';
import FormikFormRow from '../FormikFormRow';

const FieldRadio = ({
  form,
  field,
  elementProps: { onChange, onFocus, ...props },
}) => (
  <EuiRadio
    {...field}
    {...props}
    onFocus={onFocus instanceof Function ? e => onFocus(e, field, form) : onFocus}
    onChange={e => (onChange instanceof Function ? onChange(e, field, form) : field.onChange(e))}
  />
);

FieldRadio.propTypes = {
  elementProps: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  field: PropTypes.object.isRequired,
};

const FormikRadio = ({
  name,
  formRow = false,
  formikFieldProps = {},
  rowProps = {},
  elementProps = {},
}) => (
  <FormikInputWrapper
    name={name}
    formikFieldProps={formikFieldProps}
    render={({ field, form }) => {
      const fieldRadio = (<FieldRadio name={name} form={form} field={field} elementProps={elementProps} />);
      return !formRow ? fieldRadio : (
        <FormikFormRow name={name} form={form} rowProps={rowProps}>{fieldRadio}</FormikFormRow>
      );
    }}
  />
);

FormikRadio.propTypes = {
  name: PropTypes.string.isRequired,
  formRow: PropTypes.bool,
  formikFieldProps: PropTypes.object,
  rowProps: PropTypes.object,
  elementProps: PropTypes.object,
};

export default FormikRadio;
