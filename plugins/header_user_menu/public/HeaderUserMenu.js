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
import { logoutText } from './utils/i18n';

export function HeaderUserMenu({ httpClient, logoutUrl, userName, userNameTooltipText, authType }) {
  const [isOpen, setIsOpen] = useState(false);

  function openPopover() {
    setIsOpen((prevState) => !prevState);
  }

  function closePopover() {
    setIsOpen(false);
  }

  function logOut() {
    const { basePath = '' } = httpClient.basePath;

    return httpClient
      .post('/api/v1/auth/logout')
      .then((response) => {
        localStorage.clear();
        sessionStorage.clear();

        if (authType && ['openid', 'saml'].indexOf(authType) > -1) {
          if (response.redirectURL) {
            window.location.href = response.redirectURL;
          } else {
            window.location.href = `${basePath}/customerror`;
          }
        } else {
          if (logoutUrl && logoutUrl.length > 0) {
            window.location.href = logoutUrl;
          } else {
            window.location.href = `${basePath}/login?type=${authType || ''}Logout`;
          }
        }
      })
      .catch((error) => console.error('searchguard, HeaderUserMenu', error));
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
      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <EuiAvatar name={userName} />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiToolTip position="bottom" content={userNameTooltipText}>
            <EuiText>
              <p>{userName}</p>
            </EuiText>
          </EuiToolTip>

          <EuiSpacer />
          <EuiLink onClick={logOut} aria-label="logout" data-test-subj="sg.userMenu.button-logout">
            {logoutText}
          </EuiLink>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPopover>
  );
}

HeaderUserMenu.defaultProps = {
  userName: 'user',
  userNameTooltipText: 'user',
};

HeaderUserMenu.propTypes = {
  httpClient: PropTypes.object.isRequired,
  authType: PropTypes.string.isRequired,
  logoutUrl: PropTypes.string,
  userName: PropTypes.string,
  userNameTooltipText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
};
