import React from 'react';

const SimpleItemsList = ({ items }) => (
  <div>{items.map((item, i) => <div key={i}>{item}</div>)}</div>
);

export default SimpleItemsList;
