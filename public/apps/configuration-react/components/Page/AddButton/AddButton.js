import React from 'react';
import PropTypes from 'prop-types';
import { EuiButton } from '@elastic/eui';
import { addText } from '../../../utils/i18n/common';

const AddButton = ({ onClick, value = addText }) => (
  <EuiButton
    iconType="plusInCircle"
    data-test-subj="sgAddButton"
    onClick={onClick}
    size="s"
  >
    {value}
  </EuiButton>
);

AddButton.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]),
  onClick: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

export default AddButton;
