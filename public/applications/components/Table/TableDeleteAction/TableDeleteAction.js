import React from 'react';
import PropTypes from 'prop-types';
import { EuiButtonIcon } from '@elastic/eui';

const TableDeleteAction = ({ onClick, name, isDisabled = false }) => (
  <EuiButtonIcon
    data-test-subj={`sgTableCol-ActionDelete-${name}`}
    onClick={onClick}
    color="danger"
    iconType="trash"
    aria-label="Delete"
    isDisabled={isDisabled}
  />
);

TableDeleteAction.propTypes = {
  onClick: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  isDisabled: PropTypes.bool
};

export default TableDeleteAction;
