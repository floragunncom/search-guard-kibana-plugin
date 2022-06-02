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
  EuiSpacer,
  EuiButton,
  EuiOverlayMask,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiListGroup,
  EuiListGroupItem,
} from '@elastic/eui';
import { AccessControlService } from '../../../../services';
import { AccountInfoPage, AccountMainContextProvider } from '../../../accountinfo';
import { logoutText, closeText } from '../../../utils/i18n/common';
import { accountInformationText } from '../../../accountinfo/utils/i18n';

function AppListModal({ onAppClose, appModal }) {
  const closeModal = () => onAppClose(false);
  const title = appModal.title;
  const body = appModal.component;

  return (
    <EuiOverlayMask onClick={closeModal}>
      <EuiModal onClose={closeModal} style={{ maxWidth: 800 }} maxWidth={false}>
        <EuiModalHeader data-test-subj={`sg.userMenu.appListModal.header.${appModal.id}`}>
          <EuiModalHeaderTitle>
            <h1>{title}</h1>
          </EuiModalHeaderTitle>
        </EuiModalHeader>

        <EuiModalBody data-test-subj={`sg.userMenu.appListModal.body.${appModal.id}`}>
          {body}
          <EuiSpacer />
        </EuiModalBody>

        <EuiModalFooter data-test-subj={`sg.userMenu.appListModal.footer.${appModal.id}`}>
          <EuiButton onClick={closeModal} fill data-test-subj="sg.closeModal">
            {closeText}
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    </EuiOverlayMask>
  );
}

function AppList({ list = [] } = {}) {
  if (!list.length) return null;

  return (
    <EuiListGroup style={{ paddingLeft: 0 }}>
      {list.map((item, i) => (
        <EuiListGroupItem key={i} {...item} />
      ))}
    </EuiListGroup>
  );
}

const APP_MODAL_DEFAULTS = { isOpen: false };
const APP_ACCOUNT_DEFAULTS = {
  id: 'account',
  ariaLabel: 'Account Information',
  title: accountInformationText,
  component: null,
};

export function HeaderUserMenu({ httpClient, configService }) {
  const userName = configService.get('authinfo.user_name', 'User');
  const userNameTooltipText = (
    <>
      {logoutText} {userName}
    </>
  );
  const authType = configService.get('searchguard.auth.type');
  const isAccountInfoEnabled = configService.get('searchguard.accountinfo.enabled');
  const uiHelpers = configService.get('uiHelpers');
  const acService = new AccessControlService({ httpClient });

  const [isOpen, setIsOpen] = useState(false);
  const [appModal, setAppModal] = useState(APP_MODAL_DEFAULTS);

  function openPopover() {
    setIsOpen((prevState) => !prevState);
  }

  function closePopover() {
    setIsOpen(false);
  }

  function logOut() {
    acService.logout();
  }

  function closeAppListModal() {
    setAppModal(APP_MODAL_DEFAULTS);
  }

  function openAccountModal() {
    setAppModal({
      ...APP_ACCOUNT_DEFAULTS,
      isOpen: true,
      component: (
        <AccountMainContextProvider httpClient={httpClient} configService={configService}>
          <AccountInfoPage />
        </AccountMainContextProvider>
      ),
    });
  }

  const popoverButton = (
    <EuiButtonEmpty onClick={openPopover} data-test-subj="sg.userMenu.button">
      <EuiAvatar size="s" name={userName} />
    </EuiButtonEmpty>
  );

  const appList = [];

  if (authType === 'default') {
    // The logout link will display "Login" if the current user is anonymous
    const logoutControlLabel = (uiHelpers.hasAuthCookie) ? logoutText : 'Login';
    appList.push({
      label: logoutControlLabel,
      color: 'primary',
      onClick: logOut,
      'data-test-subj': 'sg.userMenu.button-logout',
    });
  }

  function renderUserName() {
    return (
      <EuiToolTip position="bottom" content={userNameTooltipText}>
        <EuiText>
          {isAccountInfoEnabled ? (
            <EuiButtonEmpty
              id="sg.userMenu.username"
              data-test-subj="sg.userMenu.username"
              onClick={openAccountModal}
            >
              {userName}
            </EuiButtonEmpty>
          ) : (
            <p style={{ wordWrap: 'break-word' }} id="sg.userMenu.username">
              {userName}
            </p>
          )}
        </EuiText>
      </EuiToolTip>
    );
  }

  return (
    <>
      <EuiPopover
        style={{ paddingTop: 2 }}
        data-test-subj="sg.userMenu"
        repositionOnScroll
        isOpen={isOpen}
        button={popoverButton}
        closePopover={closePopover}
      >
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFlexGroup alignItems="center">
              <EuiFlexItem grow={false}>
                <EuiAvatar name={userName} initialsLength={2} />
              </EuiFlexItem>
              <EuiFlexItem style={{ maxWidth: 600 }}>{renderUserName()}</EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem>
            <AppList list={appList} />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPopover>
      {appModal.isOpen && <AppListModal appModal={appModal} onAppClose={closeAppListModal} />}
    </>
  );
}

HeaderUserMenu.propTypes = {
  httpClient: PropTypes.object.isRequired,
  configService: PropTypes.object.isRequired,
};
