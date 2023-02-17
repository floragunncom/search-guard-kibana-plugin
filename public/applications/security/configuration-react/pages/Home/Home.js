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

import React, { Fragment, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiCard,
  EuiSpacer,
  EuiLoadingSpinner,
  EuiCallOut,
} from '@elastic/eui';
import { ContentPanel, Icon } from '../../components';
import { APP_PATH, PAGE_NAMES } from '../../utils/constants';
import {
  authenticationBackendsText,
  systemText,
  purgeCacheText,
  purgeCacheDescription,
  permissionsAndRolesText,
  isNoAuthenticationBackendsText,
  isNoPermissionsAndRolesText,
  isNoSystemText,
} from '../../utils/i18n/home';
import {
  internalUsersDatabaseText,
  internalUsersDatabaseDescription,
} from '../../utils/i18n/internal_users';
import {
  authenticationAndAuthorizationText,
  authenticationAndAuthorizationDescription,
} from '../../utils/i18n/auth';
import {
  systemStatus as systemStatusText,
  systemStatusDescription,
} from '../../utils/i18n/system_status';
import { tenantsText, tenantsDescription } from '../../utils/i18n/tenants';
import { actionGroupsText, actionGroupsDescription } from '../../utils/i18n/action_groups';
import { rolesText, rolesDescription } from '../../utils/i18n/roles';
import { roleMappingsText, roleMappingsDescription } from '../../utils/i18n/role_mappings';

import { Context } from '../../Context';

const Home = ({ history, onPurgeCache, purgingCache }) => {
  const { configService } = useContext(Context);

  function filterDisabledCards(cards = []) {
    return cards.filter(({ id }) => configService.get(`eliatra.security.configuration.${id}.enabled`));
  }

  const authenticationBackendsCards = filterDisabledCards([
    {
      id: PAGE_NAMES.internal_users_page,
      icon: <Icon size="xxl" type="internalUsersDatabase" />,
      title: internalUsersDatabaseText,
      description: internalUsersDatabaseDescription,
      onClick: () => history.push(APP_PATH.INTERNAL_USERS),
    },
  ]);

  const systemCards = filterDisabledCards([
    {
      id: PAGE_NAMES.auth_page,
      icon: <Icon size="xxl" type="authcAndAuthz" />,
      title: authenticationAndAuthorizationText,
      description: authenticationAndAuthorizationDescription,
      onClick: () => history.push(APP_PATH.AUTH),
    },
    {
      id: PAGE_NAMES.system_status_page,
      icon: <Icon size="xxl" type="systemStatus" />,
      title: systemStatusText,
      description: systemStatusDescription,
      onClick: () => history.push(APP_PATH.SYSTEM_STATUS),
    },
    {
      id: PAGE_NAMES.cache_page,
      icon: <Icon size="xxl" type="purgeCache" />,
      title: purgeCacheText,
      description: purgingCache ? <EuiLoadingSpinner size="xl" /> : purgeCacheDescription,
      onClick: () => onPurgeCache(),
    },
  ]);

  const permissionsAndRolesCards = filterDisabledCards([
    {
      id: PAGE_NAMES.role_mappings_page,
      icon: <Icon size="xxl" type="roleMappings" />,
      title: roleMappingsText,
      description: roleMappingsDescription,
      onClick: () => history.push(APP_PATH.ROLE_MAPPINGS),
    },
    {
      id: PAGE_NAMES.roles_page,
      icon: <Icon size="xxl" type="roles" />,
      title: rolesText,
      description: rolesDescription,
      onClick: () => history.push(APP_PATH.ROLES),
    },
    {
      id: PAGE_NAMES.action_groups_page,
      icon: <Icon size="xxl" type="actionGroups" />,
      title: actionGroupsText,
      description: actionGroupsDescription,
      onClick: () => history.push(APP_PATH.ACTION_GROUPS),
    },
    {
      id: PAGE_NAMES.tenants_page,
      icon: <Icon size="xxl" type="tenants" />,
      title: tenantsText,
      description: tenantsDescription,
      onClick: () => history.push(APP_PATH.TENANTS),
    },
  ]);

  const renderCards = (cards) =>
    cards.map(({ id, ...props }, i) => (
      <EuiFlexItem key={i} grow={false} className="sgHomeMenu__card">
        <EuiCard data-test-subj={`sgHomeMenu-${id.toLowerCase()}`} {...props} />
      </EuiFlexItem>
    ));

  const isNoPermissionsAndRoles = !permissionsAndRolesCards.length;
  const isNoEuthenticationBackends = !authenticationBackendsCards.length;
  const isNoSystem = !systemCards.length;

  return (
    <Fragment>
      <EuiFlexGroup justifyContent="spaceAround">
        <EuiFlexItem grow={false}>
          {/* <Icon type="logo" size={{ width: '150px', height: '150px' }} /> */}
        </EuiFlexItem>
      </EuiFlexGroup>

      {isNoPermissionsAndRoles ? (
        <EuiCallOut
          className="sgFixedFormItem"
          iconType="iInCircle"
          title={isNoPermissionsAndRolesText}
        />
      ) : (
        <ContentPanel title={permissionsAndRolesText}>
          <EuiFlexGroup>{renderCards(permissionsAndRolesCards)}</EuiFlexGroup>
        </ContentPanel>
      )}
      <EuiSpacer size="xl" />

      {isNoEuthenticationBackends ? (
        <EuiCallOut
          className="sgFixedFormItem"
          iconType="iInCircle"
          title={isNoAuthenticationBackendsText}
        />
      ) : (
        <ContentPanel title={authenticationBackendsText}>
          <EuiFlexGroup>{renderCards(authenticationBackendsCards)}</EuiFlexGroup>
        </ContentPanel>
      )}
      <EuiSpacer size="xl" />

      {isNoSystem ? (
        <EuiCallOut className="sgFixedFormItem" iconType="iInCircle" title={isNoSystemText} />
      ) : (
        <ContentPanel title={systemText}>
          <EuiFlexGroup>{renderCards(systemCards)}</EuiFlexGroup>
        </ContentPanel>
      )}
    </Fragment>
  );
};

Home.propTypes = {
  history: PropTypes.object.isRequired,
  onPurgeCache: PropTypes.func.isRequired,
  purgingCache: PropTypes.bool.isRequired,
};

export default Home;
