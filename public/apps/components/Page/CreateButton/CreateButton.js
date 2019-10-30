import React from 'react';
import PropTypes from 'prop-types';
import { EuiButton } from '@elastic/eui';
import { newText } from '../../../utils/i18n/common';

const CreateButton = ({ onClick, value, iconType }) => (
  <EuiButton
    data-test-subj="sgContentPanelCreateButton"
    iconType={iconType}
    onClick={onClick}
  >
    {value}
  </EuiButton>
);

CreateButton.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]).isRequired,
  iconType: PropTypes.string,
  onClick: PropTypes.func.isRequired
};

CreateButton.defaultProps = {
  value: newText,
  iconType: 'empty'
};

export default CreateButton;
