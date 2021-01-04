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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import { isEmpty } from 'lodash';
import {
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageContent,
  EuiPageContentBody,
} from '@elastic/eui';
import Home from '../Home';
import {
  InternalUsers,
  CreateInternalUser,
  Auth,
  SystemStatus,
  Tenants,
  CreateTenant,
  ActionGroups,
  CreateActionGroup,
  Roles,
  CreateRole,
  RoleMappings,
  CreateRoleMapping,
} from '../';
import { Breadcrumbs, Callout, LoadingPage } from '../../components';
import { LicenseWarningCallout } from '../../../../components';
import { APP_PATH, LOCAL_STORAGE } from '../../utils/constants';
import { apiAccessStateForbiddenText, apiAccessStateNotEnabledText } from '../../utils/i18n/main';
import { API_ACCESS_STATE } from './utils/constants';
import { LocalStorageService, ApiService } from '../../services';
import getBreadcrumb from './utils/getBreadcrumb';

import { Context } from '../../Context';

class Main extends Component {
  static contextType = Context;

  constructor(props, context) {
    super(props, context);

    this.localStorage = new LocalStorageService();
    this.apiService = new ApiService(context.httpClient);
    this.configService = context.configService;

    this.state = {
      purgingCache: false,
      sideNavItems: [],
      selectedSideNavItemName: undefined,
      apiAccessState: API_ACCESS_STATE.PENDING,
    };
  }

  componentDidMount() {
    this.checkAPIAccess();
    if (isEmpty(this.localStorage.cache)) this.localStorage.cache = LOCAL_STORAGE;
  }

  checkAPIAccess = async () => {
    try {
      if (!this.configService.restApiEnabled()) {
        this.context.triggerErrorCallout({ message: apiAccessStateNotEnabledText });
      } else {
        if (!this.configService.hasApiAccess()) {
          this.context.triggerErrorCallout({ message: apiAccessStateForbiddenText });
        } else {
          this.setState({ apiAccessState: API_ACCESS_STATE.OK });
        }
      }
    } catch (error) {
      this.context.triggerErrorCallout(error);
    }
  };

  handlePurgeCache = async () => {
    this.setState({ purgingCache: true });
    try {
      await this.apiService.clearCache();
    } catch (error) {
      this.context.triggerErrorCallout(error);
    }
    this.setState({ purgingCache: false });
  };

  render() {
    const { purgingCache, apiAccessState } = this.state;
    const { callout, setCallout, configService } = this.context;
    const { history, ...rest } = this.props;

    const isAPIAccessPending = apiAccessState === API_ACCESS_STATE.PENDING;
    const isAPIAccessOk = apiAccessState === API_ACCESS_STATE.OK;

    return (
      <EuiPage id="searchGuardKibanaPlugin">
        <EuiPageBody className="container">
          <EuiPageHeader>
            <Breadcrumbs history={history} onGetBreadcrumb={getBreadcrumb} {...rest} />
          </EuiPageHeader>

          <EuiPageContent>
            <EuiPageContentBody>
              <LicenseWarningCallout configService={configService} />
              <Callout callout={callout} onClose={() => setCallout(null)} />
              {isAPIAccessPending && LoadingPage}
              {isAPIAccessOk && (
                <Switch>
                  <Route
                    path={APP_PATH.CREATE_INTERNAL_USER}
                    render={(props) => <CreateInternalUser {...props} />}
                  />
                  <Route
                    path={APP_PATH.INTERNAL_USERS}
                    render={(props) => <InternalUsers {...props} />}
                  />
                  <Route path={APP_PATH.AUTH} render={(props) => <Auth {...props} />} />
                  <Route
                    path={APP_PATH.SYSTEM_STATUS}
                    render={(props) => <SystemStatus {...props} />}
                  />
                  <Route path={APP_PATH.TENANTS} render={(props) => <Tenants {...props} />} />
                  <Route
                    path={APP_PATH.CREATE_TENANT}
                    render={(props) => <CreateTenant {...props} />}
                  />
                  <Route
                    path={APP_PATH.ACTION_GROUPS}
                    render={(props) => <ActionGroups {...props} />}
                  />
                  <Route
                    path={APP_PATH.CREATE_ACTION_GROUP}
                    render={(props) => <CreateActionGroup {...props} />}
                  />
                  <Route path={APP_PATH.ROLES} render={(props) => <Roles {...props} />} />
                  <Route
                    path={APP_PATH.CREATE_ROLE}
                    render={(props) => <CreateRole {...props} />}
                  />
                  <Route
                    path={APP_PATH.ROLE_MAPPINGS}
                    render={(props) => <RoleMappings {...props} />}
                  />
                  <Route
                    path={APP_PATH.CREATE_ROLE_MAPPING}
                    render={(props) => <CreateRoleMapping {...props} />}
                  />
                  <Route
                    render={(props) => (
                      <Home
                        purgingCache={purgingCache}
                        onPurgeCache={this.handlePurgeCache}
                        {...props}
                      />
                    )}
                  />
                </Switch>
              )}
            </EuiPageContentBody>
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    );
  }
}

Main.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default Main;
