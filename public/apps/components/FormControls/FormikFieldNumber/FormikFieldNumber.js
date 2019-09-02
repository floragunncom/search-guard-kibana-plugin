import React from 'react';
import PropTypes from 'prop-types';
import { EuiFieldNumber } from '@elastic/eui';

import FormikInputWrapper from '../FormikInputWrapper';
import FormikFormRow from '../FormikFormRow';

const FieldNumber = ({
  name,
  form,
  field,
  elementProps: { onChange, isInvalid, ...props }
}) => (
  <EuiFieldNumber
    {...field}
    {...props}
    id={name}
    isInvalid={isInvalid instanceof Function ? isInvalid(name, form) : isInvalid}
    onChange={e => (onChange instanceof Function ? onChange(e, field, form) : field.onChange(e))}
  />
);

FieldNumber.propTypes = {
  name: PropTypes.string.isRequired,
  elementProps: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  field: PropTypes.object.isRequired,
};

const FormikFieldNumber = ({
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
      const fieldNumber = <FieldNumber name={name} form={form} field={field} elementProps={elementProps} />;
      return !formRow
        ? fieldNumber
        : <FormikFormRow name={name} form={form} rowProps={rowProps}>{fieldNumber}</FormikFormRow>;
    }}
  />
);

FormikFieldNumber.propTypes = {
  name: PropTypes.string.isRequired,
  formRow: PropTypes.bool,
  formikFieldProps: PropTypes.object,
  rowProps: PropTypes.object,
  elementProps: PropTypes.object,
};

export default FormikFieldNumber;
