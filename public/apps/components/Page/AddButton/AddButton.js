import React from 'react';
import PropTypes from 'prop-types';
import { EuiButton } from '@elastic/eui';
import { addText } from '../../../utils/i18n/common';

const ID = 'sgAddButton';

const AddButton = ({
  onClick,
  value,
  name,
  isLoading,
  iconType,
  size
}) => {
  const id = name ? `${ID}-${name}` : ID;

  return (
    <EuiButton
      iconType={iconType}
      data-test-subj={id}
      id={id}
      onClick={onClick}
      size={size}
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
  name: PropTypes.string,
  iconType: PropTypes.string,
  size: PropTypes.string
};

AddButton.defaultProps = {
  value: addText,
  name: '',
  iconType: 'plusInCircle',
  size: 'm'
};

export default AddButton;
