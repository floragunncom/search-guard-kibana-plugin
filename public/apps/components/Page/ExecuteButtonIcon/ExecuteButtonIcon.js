import React from 'react';
import PropTypes from 'prop-types';
import { EuiButtonIcon, EuiToolTip } from '@elastic/eui';
import { executeText } from '../../../utils/i18n/common';

const ExecuteButtonIcon = ({
  onClick,
  isDisabled,
  name,
  iconType,
  size,
  ariaLabel,
  tooltipProps
}) => {
  let id = 'sgExecuteButtonIcon';
  if (name) id += `-${name}`;

  return (
    <EuiToolTip {...tooltipProps}>
      <EuiButtonIcon
        aria-label={ariaLabel}
        data-test-subj={id}
        id={id}
        size={size}
        iconType={iconType}
        onClick={onClick}
        isDisabled={isDisabled}
      />
    </EuiToolTip>
  );
};

ExecuteButtonIcon.defaultProps = {
  ariaLabel: 'Execute',
  iconType: 'play',
  size: 's',
  tooltipProps: {
    title: executeText
  }
};

ExecuteButtonIcon.propTypes = {
  onClick: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
  name: PropTypes.string,
  tooltipProps: PropTypes.shape({
    title: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.string
    ]),
    content: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.string
    ])
  })
};

export default ExecuteButtonIcon;
