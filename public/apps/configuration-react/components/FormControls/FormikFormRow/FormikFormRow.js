import React from 'react';
import PropTypes from 'prop-types';
import { EuiFormRow } from '@elastic/eui';

const FormikFormRow = ({
  children,
  form,
  name,
  rowProps: { isInvalid, error, ...props }
}) => (
  <EuiFormRow
    id={name}
    isInvalid={isInvalid instanceof Function ? isInvalid(name, form) : isInvalid}
    error={error instanceof Function ? error(name, form) : error}
    {...props}
  >
    {children}
  </EuiFormRow>
);

FormikFormRow.propTypes = {
  name: PropTypes.string.isRequired,
  rowProps: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
};

export default FormikFormRow;
