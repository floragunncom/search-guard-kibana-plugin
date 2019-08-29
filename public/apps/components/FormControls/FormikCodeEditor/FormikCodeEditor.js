import React from 'react';
import PropTypes from 'prop-types';
import { EuiCodeEditor } from '@elastic/eui';
import FormikInputWrapper from '../FormikInputWrapper';
import FormikFormRow from '../FormikFormRow';

const CodeEditor = ({ name, form, field, elementProps: { onBlur, onChange, ...rest } }) => (
  <EuiCodeEditor
    id={name}
    value={field.value}
    onChange={onChange instanceof Function ? string => onChange(string, field, form) : onChange}
    onBlur={onBlur instanceof Function ? e => onBlur(e, field, form) : onBlur}
    {...rest}
  />
);

CodeEditor.propTypes = {
  name: PropTypes.string.isRequired,
  elementProps: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  field: PropTypes.object.isRequired,
};

const FormikCodeEditor = ({
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
      const codeEditor = (<CodeEditor name={name} form={form} field={field} elementProps={elementProps} />);
      return !formRow ? codeEditor : (
        <FormikFormRow name={name} form={form} rowProps={rowProps}>{codeEditor}</FormikFormRow>
      );
    }}
  />
);

FormikCodeEditor.propTypes = {
  name: PropTypes.string.isRequired,
  formRow: PropTypes.bool,
  formikFieldProps: PropTypes.object,
  rowProps: PropTypes.object,
  elementProps: PropTypes.object,
};

export default FormikCodeEditor;
