import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiCard,
  EuiIcon,
  EuiSpacer
} from '@elastic/eui';
import { ContentPanel } from '../../components';
import { APP_PATH } from '../../utils/constants';
import { authenticationBackendsText } from '../../utils/i18n/home';
import {
  internalUsersDatabaseText,
  internalUsersDatabaseDescription
} from '../../utils/i18n/internal_users';
import {
  authenticationAndAuthorizationText,
  authenticationAndAuthorizationDescription
} from '../../utils/i18n/auth';
import {
  systemText
} from '../../utils/i18n/common';
import {
  systemStatus as systemStatusText,
  systemStatusDescription
} from '../../utils/i18n/system_status';

const Home = ({ history }) => {
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
  history: PropTypes.object.isRequired
};

export default Home;
