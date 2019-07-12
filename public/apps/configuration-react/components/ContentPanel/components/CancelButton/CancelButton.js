import React from 'react';
import PropTypes from 'prop-types';
import { EuiButton } from '@elastic/eui';
import { cancelText } from '../../../../utils/i18n/common';

const CancelButton = ({ onClick, value }) => (
  <EuiButton
    data-test-subj="sgContentPanelCancelButton"
    onClick={onClick}
  >
    {value}
  </EuiButton>
);

CancelButton.defaultProps = {
  value: cancelText
};

CancelButton.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]),
  onClick: PropTypes.func.isRequired
};

export default CancelButton;
