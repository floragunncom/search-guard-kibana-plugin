import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'formik';

const FormikInputWrapper = ({ name, formikFieldProps, render }) => (
  <Field
    name={name}
    {...formikFieldProps}
    render={({ field, form }) => render({ field, form })}
  />
);

FormikInputWrapper.propTypes = {
  name: PropTypes.string.isRequired,
  formikFieldProps: PropTypes.object.isRequired,
  render: PropTypes.func.isRequired,
};

export default FormikInputWrapper;
