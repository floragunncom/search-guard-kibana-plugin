import React from 'react';
import PropTypes from 'prop-types';
import { EuiButtonIcon, EuiToolTip } from '@elastic/eui';
import { deleteText } from '../../../utils/i18n/common';

const DeleteButtonIcon = ({
  name,
  isDisabled,
  onClick,
  ariaLabel,
  tooltipProps
}) => {
  let id = 'sgDeleteButtonIcon';
  if (name) id += `-${name}`;

  return (
    <EuiToolTip {...tooltipProps}>
      <EuiButtonIcon
        aria-label={ariaLabel}
        data-test-subj={id}
        id={id}
        size="s"
        iconType="trash"
        color="danger"
        onClick={onClick}
        isDisabled={isDisabled}
      />
    </EuiToolTip>
  );
};

DeleteButtonIcon.defaultProps = {
  ariaLabel: 'Delete',
  tooltipProps: {
    title: deleteText
  }
};

DeleteButtonIcon.propTypes = {
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

export default DeleteButtonIcon;
