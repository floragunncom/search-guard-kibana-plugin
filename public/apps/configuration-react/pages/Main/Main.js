import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import {
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageContent,
  EuiPageContentBody
} from '@elastic/eui';
import Home from '../Home';
import { CreateInternalUser } from '../CreateInternalUser';
import { InternalUsers } from '../InternalUsers';
import { Breadcrumbs } from '../../components';
import { APP_PATH } from '../../utils/constants';

import '../../less/main.less';

const Main = ({ httpClient, history, ...rest }) => (
  <EuiPage id="searchGuardKibanaPlugin">
    <EuiPageBody>

      <EuiPageHeader>
        <Breadcrumbs history={history} {...rest} />
      </EuiPageHeader>

      <EuiPageContent>
        <EuiPageContentBody>
          <Switch>
            <Route
              path={APP_PATH.CREATE_INTERNAL_USER}
              render={props => <CreateInternalUser httpClient={httpClient} {...props} />}
            />
            <Route
              path={APP_PATH.INTERNAL_USERS}
              render={props => <InternalUsers httpClient={httpClient} {...props} />}
            />
            <Route
              render={props => <Home {...props} />}
            />
          </Switch>
        </EuiPageContentBody>
      </EuiPageContent>

    </EuiPageBody>
  </EuiPage>
);

Main.propTypes = {
  httpClient: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

export default Main;
