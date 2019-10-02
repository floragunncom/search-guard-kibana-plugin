import React from 'react';
import PropTypes from 'prop-types';
import { EuiButtonIcon } from '@elastic/eui';

const ExecuteButtonIcon = ({
  onClick,
  isDisabled,
  name,
  ariaLabel,
  iconType,
  size,
}) => {
  let id = 'sgExecuteButtonIcon';
  if (name) id += `-${name}`;

  return (
    <EuiButtonIcon
      data-test-subj={id}
      id={id}
      size={size}
      iconType={iconType}
      aria-label={ariaLabel}
      onClick={onClick}
      isDisabled={isDisabled}
    />
  );
};

ExecuteButtonIcon.defaultProps = {
  ariaLabel: 'Execute',
  iconType: 'play',
  size: 's',
};

ExecuteButtonIcon.propTypes = {
  onClick: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
  name: PropTypes.string,
};

export default ExecuteButtonIcon;
