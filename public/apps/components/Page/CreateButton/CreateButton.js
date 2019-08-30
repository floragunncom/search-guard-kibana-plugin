import React from 'react';
import PropTypes from 'prop-types';
import { EuiButton } from '@elastic/eui';

const CreateButton = ({ onClick, value }) => (
  <EuiButton
    data-test-subj="sgContentPanelCreateButton"
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
  onClick: PropTypes.func.isRequired
};

export default CreateButton;
