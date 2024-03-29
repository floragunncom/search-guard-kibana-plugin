import React from 'react';
import PropTypes from 'prop-types';
import { EuiButton, EuiPopover, EuiContextMenu, EuiErrorBoundary } from '@elastic/eui';
import { addText } from '../../../utils/i18n/common';

const ID = 'sgPopoverButton';

const PopoverButton = ({
  onClick,
  buttonText,
  isPopoverOpen,
  isLoading,
  contextMenuPanels,
  name
}) => {
  const id = name ? `${ID}-${name}` : ID;

  const button = (
    <EuiButton
      data-test-subj={id}
      id={id}
      iconType="arrowDown"
      iconSide="left"
      onClick={onClick}
      isLoading={isLoading}
      isDisabled={isLoading}
    >
      {buttonText}
    </EuiButton>
  );

  return (
    <EuiErrorBoundary>
      <EuiPopover
        data-test-subj="sg.popover"
        id="notFormikContextMenu"
        button={button}
        isOpen={isPopoverOpen}
        panelPaddingSize="none"
        anchorPosition="upLeft"
        closePopover={onClick}
      >
        <EuiContextMenu
          data-test-subj="sg.contextMenu"
          initialPanelId={0}
          panels={contextMenuPanels}
        />
      </EuiPopover>
    </EuiErrorBoundary>
  );
};

PopoverButton.defaultProps = {
  buttonText: addText,
  isLoading: false,
  name: ''
};

PopoverButton.propTypes = {
  buttonText: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]),
  onClick: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  isPopoverOpen: PropTypes.bool.isRequired,
  contextMenuPanels: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      icon: PropTypes.node,
      onClick: PropTypes.func.isRequired
    }).isRequired).isRequired
  }).isRequired).isRequired,
  name: PropTypes.string
};

export default PopoverButton;
