import React from 'react';
import PropTypes from 'prop-types';
import { EuiButtonIcon } from '@elastic/eui';

const DeleteButtonIcon = ({ onClick, isDisabled, name, ariaLabel }) => {
  let id = 'sgDeleteButtonIcon';
  if (name) id += `-${name}`;

  return (
    <EuiButtonIcon
      data-test-subj={id}
      id={id}
      size="s"
      iconType="trash"
      color="danger"
      aria-label={ariaLabel}
      onClick={onClick}
      isDisabled={isDisabled}
    />
  );
};

DeleteButtonIcon.defaultProps = {
  ariaLabel: 'Delete'
};

DeleteButtonIcon.propTypes = {
  onClick: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
  name: PropTypes.string,
};

export default DeleteButtonIcon;
