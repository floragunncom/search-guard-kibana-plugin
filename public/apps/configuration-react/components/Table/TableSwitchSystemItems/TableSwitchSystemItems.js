import React from 'react';
import PropTypes from 'prop-types';
import { EuiSwitch } from '@elastic/eui';

const TableSwitchSystemItems = ({ onChange, label, isChecked }) => (
  <EuiSwitch
    data-test-subj="sgTableSwitchSystemItems"
    label={label}
    checked={isChecked}
    onChange={onChange}
  />
);

TableSwitchSystemItems.propTypes = {
  onChange: PropTypes.func.isRequired,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]).isRequired,
  isChecked: PropTypes.bool.isRequired
};

export default TableSwitchSystemItems;
