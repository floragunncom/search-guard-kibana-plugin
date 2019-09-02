import React from 'react';
import PropTypes from 'prop-types';
import { EuiTextArea } from '@elastic/eui';
import FormikInputWrapper from '../FormikInputWrapper';
import FormikFormRow from '../FormikFormRow';

const TextArea = ({
  name,
  form,
  field,
  elementProps: { isInvalid, ...props }
}) => (
  <EuiTextArea
    {...field}
    {...props}
    id={name}
    isInvalid={isInvalid instanceof Function ? isInvalid(name, form) : isInvalid}
  />
);

TextArea.propTypes = {
  name: PropTypes.string.isRequired,
  elementProps: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  field: PropTypes.object.isRequired,
};

const FormikTextArea = ({
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
      const textArea = <TextArea name={name} form={form} field={field} elementProps={elementProps} />;
      return !formRow
        ? textArea
        : <FormikFormRow name={name} form={form} rowProps={rowProps}>{textArea}</FormikFormRow>;
    }}
  />
);

FormikTextArea.propTypes = {
  name: PropTypes.string.isRequired,
  formRow: PropTypes.bool,
  formikFieldProps: PropTypes.object,
  rowProps: PropTypes.object,
  elementProps: PropTypes.object,
};

export default FormikTextArea;
