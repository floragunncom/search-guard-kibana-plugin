import React from 'react';
import PropTypes from 'prop-types';
import { EuiButton } from '@elastic/eui';
import { saveText } from '../../../utils/i18n/common';

const SaveButton = ({ onClick, isLoading = false, isDisabled = false, value = saveText }) => (
  <EuiButton
    fill
    iconType="save"
    data-test-subj="sgContentPanelSaveButton"
    onClick={onClick}
    isDisabled={isDisabled}
    isLoading={isLoading}
  >
    {value}
  </EuiButton>
);

SaveButton.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]),
  onClick: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  isDisabled: PropTypes.bool
};

export default SaveButton;
