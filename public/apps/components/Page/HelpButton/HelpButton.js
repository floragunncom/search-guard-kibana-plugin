import React from 'react';
import PropTypes from 'prop-types';
import { EuiButton } from '@elastic/eui';
import { helpText } from '../../../utils/i18n/common';

const HelpButton = ({ onClick, value = helpText }) => (
  <EuiButton
    iconType="help"
    data-test-subj="sgHelpButton"
    id="help-button"
    onClick={onClick}
  >
    {value}
  </EuiButton>
);

HelpButton.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]),
  onClick: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

export default HelpButton;
