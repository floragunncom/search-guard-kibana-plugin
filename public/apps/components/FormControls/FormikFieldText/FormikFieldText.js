import React from 'react';
import PropTypes from 'prop-types';
import { EuiFieldText } from '@elastic/eui';
import FormikInputWrapper from '../FormikInputWrapper';
import FormikFormRow from '../FormikFormRow';

const FieldText = ({
  name,
  form,
  field,
  elementProps: { onChange, isInvalid, onFocus, ...props },
}) => (
  <EuiFieldText
    name={name}
    {...field}
    {...props}
    id={name}
    isInvalid={isInvalid instanceof Function ? isInvalid(name, form) : isInvalid}
    onFocus={onFocus instanceof Function ? e => onFocus(e, field, form) : onFocus}
    onChange={e => (onChange instanceof Function ? onChange(e, field, form) : field.onChange(e))}
  />
);

FieldText.propTypes = {
  name: PropTypes.string.isRequired,
  elementProps: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  field: PropTypes.object.isRequired,
};

const FormikFieldText = ({
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
      const fieldText = (<FieldText name={name} form={form} field={field} elementProps={elementProps} />);
      return !formRow ? fieldText : (
        <FormikFormRow name={name} form={form} rowProps={rowProps}>{fieldText}</FormikFormRow>
      );
    }}
  />
);

FormikFieldText.propTypes = {
  name: PropTypes.string.isRequired,
  formRow: PropTypes.bool,
  formikFieldProps: PropTypes.object,
  rowProps: PropTypes.object,
  elementProps: PropTypes.object,
};

export default FormikFieldText;
