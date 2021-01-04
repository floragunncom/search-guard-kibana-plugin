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
import { isEmpty } from 'lodash';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiCard,
  EuiSpacer,
  EuiLoadingSpinner,
  EuiCallOut,
  EuiText,
} from '@elastic/eui';
import { ContentPanel, Icon } from '../../components';
import { APP_PATH } from '../../utils/constants';
import { ENDPOINTS, METHODS_FOR_ENDPOINTS } from './utils/constants';
import {
  authenticationBackendsText,
  systemText,
  purgeCacheText,
  purgeCacheDescription,
  permissionsAndRolesText,
  isNoAuthenticationBackendsText,
  isNoPermissionsAndRolesText,
  isNoSystemText,
  sgDescriptionText,
} from '../../utils/i18n/home';
import {
  internalUsersDatabaseText,
  internalUsersDatabaseShortDescriptionText,
} from '../../utils/i18n/internal_users';
import {
  authenticationAndAuthorizationText,
  authenticationAndAuthorizationShortDescriptionText,
} from '../../utils/i18n/auth';
import {
  systemStatus as systemStatusText,
  systemStatusShortDescriptionText,
} from '../../utils/i18n/system_status';
import { tenantsText, tenantsShortDescriptionText } from '../../utils/i18n/tenants';
import { actionGroupsText, actionGroupsShortDescriptionText } from '../../utils/i18n/action_groups';
import { rolesText, rolesShortDescriptionText } from '../../utils/i18n/roles';
import { roleMappingsText, roleMappingsShortDescriptionText } from '../../utils/i18n/role_mappings';

import { Context } from '../../Context';

const Home = ({ history, onPurgeCache, purgingCache }) => {
  const { configService } = useContext(Context);

  const filterDisabledCards = (cards = []) => {
    return cards.filter(({ endpoint }) => {
      return configService.endpointAndMethodEnabled(endpoint, METHODS_FOR_ENDPOINTS[endpoint]);
    });
  };

  const authenticationBackendsCards = filterDisabledCards([
    {
      endpoint: ENDPOINTS.INTERNALUSERS,
      icon: <Icon size="xxl" type="internalUsersDatabase" />,
      title: internalUsersDatabaseText,
      description: internalUsersDatabaseShortDescriptionText,
      onClick: () => history.push(APP_PATH.INTERNAL_USERS),
    },
  ]);

  const systemCards = filterDisabledCards([
    {
      endpoint: ENDPOINTS.SGCONFIG,
      icon: <Icon size="xxl" type="authcAndAuthz" />,
      title: authenticationAndAuthorizationText,
      description: authenticationAndAuthorizationShortDescriptionText,
      onClick: () => history.push(APP_PATH.AUTH),
    },
    {
      endpoint: ENDPOINTS.LICENSE,
      icon: <Icon size="xxl" type="systemStatus" />,
      title: systemStatusText,
      description: systemStatusShortDescriptionText,
      onClick: () => history.push(APP_PATH.SYSTEM_STATUS),
    },
    {
      endpoint: ENDPOINTS.CACHE,
      icon: <Icon size="xxl" type="purgeCache" />,
      title: purgeCacheText,
      description: purgingCache ? <EuiLoadingSpinner size="xl" /> : purgeCacheDescription,
      onClick: () => onPurgeCache(),
    },
  ]);

  const permissionsAndRolesCards = filterDisabledCards([
    {
      endpoint: ENDPOINTS.ROLESMAPPING,
      icon: <Icon size="xxl" type="roleMappings" />,
      title: roleMappingsText,
      description: roleMappingsShortDescriptionText,
      onClick: () => history.push(APP_PATH.ROLE_MAPPINGS),
    },
    {
      endpoint: ENDPOINTS.ROLES,
      icon: <Icon size="xxl" type="roles" />,
      title: rolesText,
      description: rolesShortDescriptionText,
      onClick: () => history.push(APP_PATH.ROLES),
    },
    {
      endpoint: ENDPOINTS.ACTIONGROUPS,
      icon: <Icon size="xxl" type="actionGroups" />,
      title: actionGroupsText,
      description: actionGroupsShortDescriptionText,
      onClick: () => history.push(APP_PATH.ACTION_GROUPS),
    },
    {
      endpoint: ENDPOINTS.TENANTS,
      icon: <Icon size="xxl" type="tenants" />,
      title: tenantsText,
      description: tenantsShortDescriptionText,
      onClick: () => history.push(APP_PATH.TENANTS),
    },
  ]);

  const renderCards = (cards) =>
    cards.map((card, i) => (
      <EuiFlexItem key={i} grow={false} className="sgHomeMenu__card">
        <EuiCard
          data-test-subj={`sgHomeMenu-${card.endpoint.toLowerCase()}`}
          icon={card.icon}
          title={card.title}
          description={card.description}
          onClick={() => card.onClick()}
        />
      </EuiFlexItem>
    ));

  const isNoPermissionsAndRoles = isEmpty(permissionsAndRolesCards);
  const isNoEuthenticationBackends = isEmpty(authenticationBackendsCards);
  const isNoSystem = isEmpty(systemCards);

  return (
    <Fragment>
      <EuiFlexGroup justifyContent="center" alignItems="center" direction="column">
        <EuiFlexItem grow={false}>
          <Icon type="logo" size={{ width: '150px', height: '150px' }} />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiText>{sgDescriptionText}</EuiText>
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
