import React from 'react';
import PropTypes from 'prop-types';
import { EuiText } from '@elastic/eui';

const TableTextCell = ({ name, value }) => (
  <div data-test-subj={`sgTableCol-${name}`}>
    <EuiText>{value}</EuiText>
  </div>
);

TableTextCell.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string
  ]).isRequired
};

export default TableTextCell;
