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

import React, { Component, Fragment } from 'react';
import { API_ROOT } from '../../utils/constants';

import { EuiPage, EuiPageBody, EuiPageContent, EuiPageContentBody, EuiText } from '@elastic/eui';
import { LicenseWarningCallout } from '../components';

import { MainContext } from './contexts/MainContextProvider';
import {
  sgRolesHeader,
  accountPluginVersion,
  userNameHeader,
  sgRolesEmpty,
  backendRolesHeader,
  backendRolesEmpty,
} from './utils/i18n';

const APP_NAME = 'Account Info';

export class AccountInfoPage extends Component {
  static contextType = MainContext;

  constructor(props, context) {
    super(props, context);

    this.state = {
      sgUser: null,
    };

    const { addErrorToast } = context;

    this.fetchUser(addErrorToast);
  }

  fetchUser(addErrorToast) {
    const { httpClient } = this.context;

    httpClient.get(`${API_ROOT}/auth/authinfo`).then(
      (response) => {
        this.setState({
          sgUser: response.data,
        });
      },
      (error) => {
        addErrorToast(error);
      }
    );
  }

  render() {
    const { sgUser } = this.state;

    return (
      <EuiPage id={APP_NAME}>
        <EuiPageBody className="sp-container">
          <EuiPageContent>
            <EuiPageContentBody className="sp-page-content-body">
              <LicenseWarningCallout configService={this.context.configService} />

              {sgUser && (
                <EuiText>
                  <h2>{userNameHeader}</h2>
                  <p>{sgUser.user_name}</p>

                  <h2>{sgRolesHeader}</h2>
                  <p>
                    {sgUser.effective_roles.length === 0
                      ? sgRolesEmpty
                      : sgUser.effective_roles.map((role) => (
                          <Fragment key={role}>
                            {role}
                            <br />
                          </Fragment>
                        ))}
                  </p>

                  <h2>{backendRolesHeader}</h2>
                  <p>
                    {sgUser.backend_roles.length === 0
                      ? backendRolesEmpty
                      : sgUser.backend_roles.map((role) => (
                          <Fragment key={role}>
                            {role}
                            <br />
                          </Fragment>
                        ))}
                  </p>

                  <EuiText size="xs" style={{ fontStyle: 'italic' }}>
                    {accountPluginVersion(this.context.configService.get('eliatrasuite.spVersion'))}
                  </EuiText>
                </EuiText>
              )}
            </EuiPageContentBody>
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    );
  }
}
