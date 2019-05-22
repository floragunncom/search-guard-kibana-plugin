import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiCard,
  EuiIcon,
  EuiSpacer,
  EuiLoadingSpinner
} from '@elastic/eui';
import { ContentPanel } from '../../components';
import { APP_PATH } from '../../utils/constants';
import {
  authenticationBackendsText,
  systemText,
  purgeCacheText,
  purgeCacheDescription,
  permissionsAndRolesText
} from '../../utils/i18n/home';
import {
  internalUsersDatabaseText,
  internalUsersDatabaseDescription
} from '../../utils/i18n/internal_users';
import {
  authenticationAndAuthorizationText,
  authenticationAndAuthorizationDescription
} from '../../utils/i18n/auth';
import {
  systemStatus as systemStatusText,
  systemStatusDescription
} from '../../utils/i18n/system_status';
import {
  tenantsText,
  tenantsDescription
} from '../../utils/i18n/tenants';
import {
  actionGroupsText,
  actionGroupsDescription
} from '../../utils/i18n/action_groups';
import {
  rolesText,
  rolesDescription
} from '../../utils/i18n/roles';
import {
  roleMappingsText,
  roleMappingsDescription
} from '../../utils/i18n/role_mappings';

const Home = ({ history, onPurgeCache, purgingCache }) => {
  // TODO: use pesonalized Search Guard icons in cards instead of the default ones
  const authenticationBackendsCards = [
    {
      icon: (<EuiIcon size="xxl" type="database" />),
      title: internalUsersDatabaseText,
      description: internalUsersDatabaseDescription,
      onClick: () => history.push(APP_PATH.INTERNAL_USERS)
    }
  ];

  const systemCards = [
    {
      icon: (<EuiIcon size="xxl" type="securityApp" />),
      title: authenticationAndAuthorizationText,
      description: authenticationAndAuthorizationDescription,
      onClick: () => history.push(APP_PATH.AUTH)
    },
    {
      icon: (<EuiIcon size="xxl" type="gear" />),
      title: systemStatusText,
      description: systemStatusDescription,
      onClick: () => history.push(APP_PATH.SYSTEM_STATUS)
    },
    {
      icon: (<EuiIcon size="xxl" type="refresh" />),
      title: purgeCacheText,
      description: (purgingCache ? <EuiLoadingSpinner size="xl" /> : purgeCacheDescription),
      onClick: () => onPurgeCache()
    }
  ];

  const permissionsAndRolesCards = [
    {
      icon: (<EuiIcon size="xxl" type="indexMapping" />),
      title: roleMappingsText,
      description: roleMappingsDescription,
      onClick: () => history.push(APP_PATH.ROLE_MAPPINGS)
    },
    {
      icon: (<EuiIcon size="xxl" type="usersRolesApp" />),
      title: rolesText,
      description: rolesDescription,
      onClick: () => history.push(APP_PATH.ROLES)
    },
    {
      icon: (<EuiIcon size="xxl" type="indexPatternApp" />),
      title: actionGroupsText,
      description: actionGroupsDescription,
      onClick: () => history.push(APP_PATH.ACTION_GROUPS)
    },
    {
      icon: (<EuiIcon size="xxl" type="grid" />),
      title: tenantsText,
      description: tenantsDescription,
      onClick: () => history.push(APP_PATH.TENANTS)
    }
  ];

  const renderCards = cards => (
    cards.map((card, i) => (
      <EuiFlexItem key={i} grow={false} className="sgHomeMenu__card">
        <EuiCard
          icon={card.icon}
          title={card.title}
          description={card.description}
          onClick={() => card.onClick()}
        />
      </EuiFlexItem>
    ))
  );

  return (
    <Fragment>
      <ContentPanel
        title={permissionsAndRolesText}
      >
        <EuiFlexGroup>
          {renderCards(permissionsAndRolesCards)}
        </EuiFlexGroup>
      </ContentPanel>

      <EuiSpacer size="xl" />

      <ContentPanel
        title={authenticationBackendsText}
      >
        <EuiFlexGroup>
          {renderCards(authenticationBackendsCards)}
        </EuiFlexGroup>
      </ContentPanel>

      <EuiSpacer size="xl" />

      <ContentPanel
        title={systemText}
      >
        <EuiFlexGroup>
          {renderCards(systemCards)}
        </EuiFlexGroup>
      </ContentPanel>

    </Fragment>
  );
};

Home.propTypes = {
  history: PropTypes.object.isRequired,
  onPurgeCache: PropTypes.func.isRequired,
  purgingCache: PropTypes.bool.isRequired
};

export default Home;
