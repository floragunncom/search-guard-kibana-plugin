/*
 *    Copyright 2021 floragunn GmbH
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
  EuiListGroup,
  EuiListGroupItem,
} from '@elastic/eui';
import { AccessControlService } from '../../../../services';
import { logoutText } from '../utils/i18n';
import {
  SEARCHGUARD_MULTITENANCY_APP_ID,
  SEARCHGUARD_MULTITENANCY_APP_TITLE,
} from '../../../multitenancy/utils/constants';
import {
  SEARCHGUARD_ACCOUNTINFO_APP_ID,
  SEARCHGUARD_ACCOUNTINFO_APP_TITLE,
} from '../../../accountinfo/utils/constants';

export function LogoutBtn({ onClick, authType }) {
  if (authType === 'kerberos' || authType === 'proxy') return null;
  return (
    <EuiLink onClick={onClick} aria-label="logout" data-test-subj="sg.userMenu.button-logout">
      {logoutText}
    </EuiLink>
  );
}

export function HeaderUserMenu({ httpClient, configService, kibanaAppService }) {
  const userNameText = configService.get('restapiinfo.user_name');
  const { type: authType, logout_url: logoutUrl } = configService.get('searchguard.auth', {});

  const [isOpen, setIsOpen] = useState(false);
  const acService = new AccessControlService({ httpClient, authType });

  const appMenu = [
    {
      label: SEARCHGUARD_ACCOUNTINFO_APP_TITLE,
      appId: SEARCHGUARD_ACCOUNTINFO_APP_ID,
      isEnabled: configService.get('searchguard.accountinfo.enabled', false),
    },
    {
      label: SEARCHGUARD_MULTITENANCY_APP_TITLE,
      appId: SEARCHGUARD_MULTITENANCY_APP_ID,
      isEnabled: configService.get('searchguard.multitenancy.enabled', false),
    },
  ];

  function openPopover() {
    setIsOpen((prevState) => !prevState);
  }

  function closePopover() {
    setIsOpen(false);
  }

  function logOut() {
    acService.logout({ logoutUrl });
  }

  function renderAppMenu(appMenu) {
    return appMenu
      .filter((item) => item.isEnabled)
      .map((item) => {
        return (
          <EuiListGroupItem
            data-test-subj={`sg.userMenu.appMenu.item.${item.appId}`}
            key={item.appId}
            label={item.label}
            onClick={() => {
              kibanaAppService.navigateToApp(item.appId);
            }}
          />
        );
      });
  }

  const button = (
    <EuiButtonEmpty onClick={openPopover} data-test-subj="sg.userMenu.button">
      <EuiAvatar size="s" name={userNameText} />
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
      <div id="sg.userMenu.content" style={{ width: '400px' }}>
        <EuiFlexGroup>
          <EuiFlexItem grow={false}>
            <EuiAvatar name={userNameText} />
          </EuiFlexItem>
          <EuiFlexItem wrap={true}>
            <EuiToolTip position="bottom" content={userNameText}>
              <EuiText>
                <div style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  {userNameText}
                </div>
              </EuiText>
            </EuiToolTip>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <LogoutBtn onClick={logOut} authType={authType} />
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer />
        <EuiListGroup flush={true} bordered={true}>
          {renderAppMenu(appMenu)}
        </EuiListGroup>
      </div>
    </EuiPopover>
  );
}

HeaderUserMenu.propTypes = {
  httpClient: PropTypes.object.isRequired,
  configService: PropTypes.object.isRequired,
  kibanaAppService: PropTypes.object.isRequired,
};
