import React from 'react';
import PropTypes from 'prop-types';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiCard,
  EuiIcon
} from '@elastic/eui';
import { ContentPanel } from '../../components';
import { APP_PATH } from '../../utils/constants';
import { authenticationBackendsText } from '../../utils/i18n/home';
import {
  internalUsersDatabaseText,
  internalUsersDatabaseDescription
} from '../../utils/i18n/internalusers';

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
      title={authenticationBackendsText}
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
