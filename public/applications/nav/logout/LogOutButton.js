/* eslint-disable @kbn/eslint/require-license-header */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  EuiButtonEmpty,
  EuiToolTip,
  EuiPopover,
  EuiAvatar,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import { AccessControlService } from '../../../services';
import { logoutText, logoutUserText } from '../utils/i18n';

export function LogOutButton({ httpClient, authType, logoutUrl, userName, logoutTooltipText }) {
  const [isOpen, setIsOpen] = useState(false);
  const acService = new AccessControlService({ httpClient, authType });

  function openPopover() {
    setIsOpen(prevState => !prevState);
  }

  function closePopover() {
    setIsOpen(false);
  }

  function logOut() {
    acService.logout({ logoutUrl });
  }

  const button = (
    <EuiButtonEmpty onClick={openPopover} data-test-subj="sg.userMenu.button">
      <EuiAvatar size="s" name={userName} />
    </EuiButtonEmpty>
  );

  return (
    <EuiPopover
      data-test-subj="sg.userMenu"
      repositionOnScroll
      isOpen={isOpen}
      button={button}
      closePopover={closePopover}
    >
      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <EuiAvatar name={userName} />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiToolTip position="bottom" content={logoutTooltipText}>
            <EuiButtonEmpty onClick={logOut} data-test-subj="sg.userMenu.button-logout">
              {logoutText} {userName}
            </EuiButtonEmpty>
          </EuiToolTip>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPopover>
  );
}

LogOutButton.defaultProps = {
  userName: 'user',
  logoutTooltipText: logoutUserText,
};

LogOutButton.propTypes = {
  httpClient: PropTypes.object.isRequired,
  authType: PropTypes.string.isRequired,
  logoutUrl: PropTypes.string,
  userName: PropTypes.string,
  logoutTooltipText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
};
