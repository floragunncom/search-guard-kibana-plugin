import React from 'react';
import PropTypes from 'prop-types';
import { EuiText } from '@elastic/eui';

const TableNameCell = ({ name, value }) => (
  <div data-test-subj={`sgTableCol${name}`}>
    <EuiText>{value}</EuiText>
  </div>
);

TableNameCell.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string
  ]).isRequired
};

export default TableNameCell;
