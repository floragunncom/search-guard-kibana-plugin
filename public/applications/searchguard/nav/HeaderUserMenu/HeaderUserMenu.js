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
  EuiText,
  EuiLink,
  EuiSpacer,
} from '@elastic/eui';
import { AccessControlService } from '../../../../services';
import { logoutText } from '../utils/i18n';

function LogoutBtn({ onClick, authType }) {
  if (authType === 'kerberos' || authType === 'proxy') return null;
  return (
    <EuiLink onClick={onClick} aria-label="logout" data-test-subj="sg.userMenu.button-logout">
      {logoutText}
    </EuiLink>
  );
}

export function HeaderUserMenu({ httpClient, configService }) {
  const userName = configService.get('authinfo.user_name', 'User');
  const userNameTooltipText = (
    <>
      {logoutText} {userName}
    </>
  );
  const authType = configService.get('searchguard.auth.type');
  const logoutUrl = configService.get('searchguard.auth.logout_url');

  const [isOpen, setIsOpen] = useState(false);
  const acService = new AccessControlService({ httpClient, authType });

  function openPopover() {
    setIsOpen((prevState) => !prevState);
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
      style={{ paddingTop: 2 }}
      data-test-subj="sg.userMenu"
      repositionOnScroll
      isOpen={isOpen}
      button={button}
      closePopover={closePopover}
    >
      <EuiFlexGroup data-test-subj="sg.userMenu.content">
        <EuiFlexItem grow={false}>
          <EuiAvatar name={userName} />
        </EuiFlexItem>
        <EuiFlexItem style={{ maxWidth: 400 }}>
          <EuiToolTip position="bottom" content={userNameTooltipText}>
            <EuiText>
              <p id="sg.userMenu.username">{userName}</p>
            </EuiText>
          </EuiToolTip>

          <EuiSpacer />
          <LogoutBtn onClick={logOut} authType={authType} />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPopover>
  );
}

HeaderUserMenu.propTypes = {
  httpClient: PropTypes.object.isRequired,
  configService: PropTypes.object.isRequired,
};
