import React from 'react';
import PropTypes from 'prop-types';
import { EuiButtonIcon } from '@elastic/eui';

const TableCloneAction = ({ onClick, name }) => (
  <EuiButtonIcon
    data-test-subj={`sgTableCol-ActionClone-${name}`}
    onClick={onClick}
    color="primary"
    iconType="copy"
    aria-label="Clone"
  />
);

TableCloneAction.propTypes = {
  onClick: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired
};

export default TableCloneAction;
