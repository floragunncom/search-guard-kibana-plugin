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
import {
  i18nInternalUsersDatabaseText,
  i18nInternalUsersDatabaseDescription,
  i18nAuthenticationBackendsText,
  i18nSystemText
} from '../../utils/i18n_nodes';
import {
  authenticationAndAuthorizationText,
  authenticationAndAuthorizationDescription
} from '../../utils/i18n/auth';

const Home = ({ history }) => {
  // TODO: use pesonalized Search Guard icons in cards instead of the default ones
  const authenticationBackendsCards = [
    {
      icon: (<EuiIcon size="xxl" type="database" />),
      title: i18nInternalUsersDatabaseText,
      description: i18nInternalUsersDatabaseDescription,
      onClick: () => history.push(APP_PATH.INTERNAL_USERS)
    }
  ];

  const systemCards = [
    {
      icon: (<EuiIcon size="xxl" type="securityApp" />),
      title: authenticationAndAuthorizationText,
      description: authenticationAndAuthorizationDescription,
      onClick: () => history.push(APP_PATH.AUTH)
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
        title={i18nAuthenticationBackendsText}
      >
        <EuiFlexGroup>
          {renderCards(authenticationBackendsCards)}
        </EuiFlexGroup>
      </ContentPanel>

      <EuiSpacer size="xl" />

      <ContentPanel
        title={i18nSystemText}
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
