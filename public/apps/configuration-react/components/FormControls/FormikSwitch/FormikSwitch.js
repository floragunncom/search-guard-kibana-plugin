import React from 'react';
import PropTypes from 'prop-types';
import { EuiSwitch } from '@elastic/eui';
import FormikInputWrapper from '../FormikInputWrapper';
import FormikFormRow from '../FormikFormRow';

const FieldSwitch = ({
  name,
  form,
  field,
  elementProps: { onChange, ...props }
}) => (
  <EuiSwitch
    name={name}
    {...props}
    {...field}
    onChange={e => (onChange instanceof Function ? onChange(e, field, form) : field.onChange(e))}
  />
);

FieldSwitch.propTypes = {
  name: PropTypes.string.isRequired,
  elementProps: PropTypes.object.isRequired,
  field: PropTypes.object.isRequired,
};

const FormikSwitch = ({
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
      const fieldSwitch = (<FieldSwitch name={name} form={form} field={field} elementProps={elementProps} />);
      return !formRow ? fieldSwitch : (
        <FormikFormRow name={name} form={form} rowProps={rowProps}>{fieldSwitch}</FormikFormRow>
      );
    }}
  />
);

FormikSwitch.propTypes = {
  name: PropTypes.string.isRequired,
  formRow: PropTypes.bool,
  formikFieldProps: PropTypes.object,
  rowProps: PropTypes.object,
  elementProps: PropTypes.object,
};

export default FormikSwitch;
