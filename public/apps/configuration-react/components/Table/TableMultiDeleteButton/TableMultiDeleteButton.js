import React from 'react';
import PropTypes from 'prop-types';
import { EuiButton } from '@elastic/eui';
import { deleteText } from '../../../utils/i18n/common';

const CancelButton = ({ onClick, numOfSelections = null }) => (
  <EuiButton
    data-test-subj="sgTableMultiDeleteButton"
    color="danger"
    iconType="trash"
    onClick={onClick}
  >
    {deleteText} {numOfSelections}
  </EuiButton>
);

CancelButton.propTypes = {
  numOfSelections: PropTypes.number,
  onClick: PropTypes.func.isRequired
};

export default CancelButton;
