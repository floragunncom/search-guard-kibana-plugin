import React from 'react';
import PropTypes from 'prop-types';

const SimpleItemsList = ({ items }) => (
  <div>{items.map((item, i) => <div key={i}>{item}</div>)}</div>
);

SimpleItemsList.propTypes = {
  items: PropTypes.array.isRequired
};

export default SimpleItemsList;
