import React from 'react';
import PropTypes from 'prop-types';
import { EuiLink } from '@elastic/eui';

const TableIdCell = ({ name, value, onClick }) => (
  <div data-test-subj={`sgTableCol-Id-${name}`}>
    <EuiLink onClick={onClick}>{value}</EuiLink>
  </div>
);

TableIdCell.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string
  ]).isRequired,
  onClick: PropTypes.func.isRequired
};

export default TableIdCell;
