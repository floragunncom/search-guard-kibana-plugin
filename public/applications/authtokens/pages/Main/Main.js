/*
 * Copyright 2023 Excelerate Technology Limited T/A Eliatra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * *    Copyright 2020 floragunn GmbH
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

import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Redirect } from 'react-router-dom';
import {
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageContent,
  EuiPageContentBody,
} from '@elastic/eui';
import { Breadcrumbs, Callout } from '../../../components';
import { AuthTokens } from '../AuthTokens';
import { CreateAuthToken } from '../CreateAuthToken';
import getBreadcrumb from './utils/getBreadcrumb';
import { Context } from '../../Context';
import { APP_PATH } from '../../utils/constants';

export function Main({ history, ...rest }) {
  const { callout, setCallout } = useContext(Context);

  return (
    <EuiPage id="eliatraSuiteAuthTokens">
      <EuiPageBody className="container">
        <EuiPageHeader>
          <Breadcrumbs history={history} onGetBreadcrumb={getBreadcrumb} {...rest} />
        </EuiPageHeader>

        <EuiPageContent>
          <EuiPageContentBody>
            <Callout callout={callout} onClose={() => setCallout(null)} />
            <Switch>
              <Route
                path={APP_PATH.CREATE_AUTH_TOKEN}
                render={(props) => <CreateAuthToken {...props} />}
              />
              <Route path={APP_PATH.AUTH_TOKENS} render={(props) => <AuthTokens {...props} />} />
              <Redirect to={APP_PATH.AUTH_TOKENS} />
            </Switch>
          </EuiPageContentBody>
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
}

Main.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};
