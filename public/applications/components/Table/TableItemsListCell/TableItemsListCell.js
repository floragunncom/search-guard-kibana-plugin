import React from 'react';
import PropTypes from 'prop-types';

const TableItemsListCell = ({ items = [], name }) => (
  <div data-test-subj={`sgTableCol-${name}`}>
    {items.map((item, i) => <div key={i}>{item}</div>)}
  </div>
);

TableItemsListCell.propTypes = {
  items: PropTypes.array.isRequired,
  name: PropTypes.string.isRequired
};

export default TableItemsListCell;
