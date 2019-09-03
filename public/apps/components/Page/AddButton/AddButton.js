import React from 'react';
import PropTypes from 'prop-types';
import { EuiButton } from '@elastic/eui';
import { addText } from '../../../utils/i18n/common';

const ID = 'sgAddButton';

const AddButton = ({
  onClick,
  value,
  name,
  isLoading
}) => {
  const id = name ? `${ID}-${name}` : ID;

  return (
    <EuiButton
      iconType="plusInCircle"
      data-test-subj={id}
      id={id}
      onClick={onClick}
      size="s"
      isLoading={isLoading}
    >
      {value}
    </EuiButton>
  );
};

AddButton.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]),
  onClick: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  name: PropTypes.string
};

AddButton.defaultProps = {
  value: addText,
  name: ''
};

export default AddButton;
