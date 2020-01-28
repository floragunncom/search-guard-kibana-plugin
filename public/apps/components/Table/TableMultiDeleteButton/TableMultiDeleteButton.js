import React from 'react';
import PropTypes from 'prop-types';
import { EuiButton } from '@elastic/eui';
import { deleteText } from '../../../utils/i18n/common';

const TableMultiDeleteButton = ({ onClick, numOfSelections = null, isLoading = false }) => (
  <EuiButton
    isDisabled={isLoading}
    isLoading={isLoading}
    data-test-subj="sgTableMultiDeleteButton"
    color="danger"
    iconType="trash"
    onClick={onClick}
  >
    {deleteText} {numOfSelections}
  </EuiButton>
);

TableMultiDeleteButton.propTypes = {
  numOfSelections: PropTypes.number,
  onClick: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

export default TableMultiDeleteButton;
