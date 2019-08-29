import React from 'react';
import PropTypes from 'prop-types';
import { EuiButtonIcon } from '@elastic/eui';

const TableInspectAction = ({ onClick, name }) => (
  <EuiButtonIcon
    data-test-subj={`sgTableCol-ActionInspect-${name}`}
    onClick={onClick}
    color="primary"
    iconType="inspect"
    aria-label="Inspect"
  />
);

TableInspectAction.propTypes = {
  onClick: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired
};

export default TableInspectAction;
