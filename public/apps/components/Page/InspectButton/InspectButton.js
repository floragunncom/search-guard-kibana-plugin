import React from 'react';
import PropTypes from 'prop-types';
import { EuiButton } from '@elastic/eui';
import { inspectText } from '../../../utils/i18n/common';

const InspectButton = ({ onClick, value = inspectText }) => (
  <EuiButton
    data-test-subj="sgInspectButton"
    size="s"
    iconType="inspect"
    onClick={onClick}
  >
    {value}
  </EuiButton>
);

InspectButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ])
};

export default InspectButton;
