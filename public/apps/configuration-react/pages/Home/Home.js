import React from 'react';
import PropTypes from 'prop-types';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiCard,
  EuiI18n,
  EuiIcon
} from '@elastic/eui';
import { ContentPanel } from '../../components';
import { APP_PATH } from '../../utils/constants';

const Home = ({ history }) => {
  // TODO: use pesonalized Search Guard icons in cards instead of the default ones
  const authenticationBackendsCards = [
    {
      icon: (<EuiIcon size="xxl" type="database" />),
      title: (
        <EuiI18n
          token="sgHomeInternalUserDatabaseEuiCard.title"
          default="Internal User Database"
        />
      ),
      description: (
        <EuiI18n
          token="sgHomeInternalUserDatabaseEuiCard.description"
          default="Use it if you do not have any external authentication system"
        />
      ),
      onClick: () => history.push(APP_PATH.INTERNAL_USERS)
    }
  ];

  const handleRenderAuthenticationBackendsCards = () => (
    authenticationBackendsCards.map((card, i) => (
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
    <ContentPanel
      title={(
        <EuiI18n
          token="sgHomeAuthenticationBackendsContentPanel.title"
          default="Authentication Backends"
        />
      )}
    >
      <EuiFlexGroup>
        {handleRenderAuthenticationBackendsCards()}
      </EuiFlexGroup>
    </ContentPanel>
  );
};

Home.propTypes = {
  history: PropTypes.object.isRequired
};

export default Home;
