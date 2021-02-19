/*
 *    Copyright 2020 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
import { AppList } from './AppList';

function LogoutBtn({ onClick, authType }) {
  if (authType === 'kerberos' || authType === 'proxy') return null;
  return (
    <EuiLink onClick={onClick} aria-label="logout" data-test-subj="sg.userMenu.button-logout">
      {logoutText}
    </EuiLink>
  );
}

export const AccountComponent = () => <p>Account component</p>;
export const MultitenancyComponent = () => <p>Multitenancy component</p>;

export function HeaderUserMenu({ httpClient, logoutUrl, userName, userNameTooltipText, authType, core }) {
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

  const appListItems = [
    {
      label: 'Account',
      component: <AccountComponent />,
      href: 'searchguard-accountinfo',
    },
    {
      label: 'Multitenancy',
      component: <MultitenancyComponent />,
      href: 'searchguard-multitenancy',
    },
  ];

  return (
    <EuiPopover
      style={{ paddingTop: 2 }}
      data-test-subj="sg.userMenu"
      repositionOnScroll
      isOpen={isOpen}
      button={button}
      closePopover={closePopover}
    >
      <div style={{ width: '400px' }}>
        <EuiFlexGroup>
          <EuiFlexItem grow={false}>
            <EuiAvatar name={userName} />
          </EuiFlexItem>
          <EuiFlexItem wrap={true}>
            <EuiToolTip position="bottom" content={userNameTooltipText}>
              <EuiText>
                <div style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{userName}</div>
              </EuiText>
            </EuiToolTip>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <LogoutBtn onClick={logOut} authType={authType} />
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer />
        <AppList items={appListItems} core={core} />
      </div>
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
