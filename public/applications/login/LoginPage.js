/* eslint-disable @kbn/eslint/require-license-header */
/**
 *    Copyright 2020 floragunn GmbH

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import React, { Component, Fragment } from 'react';

import {
  EuiSpacer,
  EuiFieldText,
  EuiFieldPassword,
  EuiForm,
  EuiFormRow,
  EuiText,
  EuiCallOut,
  EuiImage,
  EuiButton,
  EuiPanel,
} from '@elastic/eui';
import { LicenseWarningCallout } from '../../apps/components';

import { API_ROOT } from '../../utils/constants';

// @todo Move this to the new app
import { sanitizeNextUrlFromFullUrl } from '../../apps/login/sanitize_next_url';
import { SystemStateService } from '../../services';

export class LoginPage extends Component {
  //static contextType = MainContext;

  constructor(props, context) {
    super(props, context);

    // if session was not terminated by logout, clear any remaining
    // stored paths etc. from previous users, to avoid issues
    // like a non-working default index pattern
    localStorage.clear();
    sessionStorage.clear();

    // Custom styling
    this.state = {
      userName: '',
      password: '',
      alternativeLogin: this.getAlternativeLogin(),
      errorMessage: null,
    };
  }

  getAlternativeLogin() {
    const alternativeLoginConfig = this.props.basicAuthConfig.alternative_login;

    // Prepare alternative login for the view
    let alternativeLogin = null;

    if (alternativeLoginConfig.show_for_parameter) {
      // Build an object from the query parameters
      // Strip the first ? from the query parameters, if we have any
      const queryString = window.location.search.trim().replace(/^(\?)/, '');
      const queryObject = {};
      if (queryString) {
        queryString.split('&').map(parameter => {
          const parameterParts = parameter.split('=');
          if (parameterParts[1]) {
            queryObject[encodeURIComponent(parameterParts[0])] = parameterParts[1];
          }
        });
      }

      const alternativeLoginURL = queryObject[alternativeLoginConfig.show_for_parameter];
      let validRedirect = false;

      try {
        alternativeLoginConfig.valid_redirects.forEach(redirect => {
          if (new RegExp(redirect).test(alternativeLoginURL)) {
            validRedirect = true;
          }
        });
      } catch (error) {
        console.warn(error);
      }

      if (validRedirect) {
        alternativeLogin = {
          url: queryObject[alternativeLoginConfig.show_for_parameter],
        };
      }

      return alternativeLogin;
    }
  }

  /**
   * Update the credentials
   * @param event
   */
  onChange = event => {
    const { name, value } = event.target;

    this.setState({
      [name]: value,
    });
  };

  handleSubmit = async () => {
    const { httpClient } = this.props;
    this.setState({
      errorMessage: null,
    });

    try {
      const nextUrl = sanitizeNextUrlFromFullUrl(window.location.href, this.ROOT);

      httpClient
        .post(`${API_ROOT}/auth/login`, {
          username: this.state.userName,
          password: this.state.password,
        })
        .then(
          response => {
            // cache the current user information, we need it at several places
            sessionStorage.setItem('sg_user', JSON.stringify(response.data));
            // load and cache systeminfo and rest api info
            // perform in the callback due to Chrome cancelling the
            // promises if we navigate away from the page, even if async/await

            const systemStateService = new SystemStateService(httpClient);
            systemStateService.loadSystemInfo().then(response => {
              systemStateService.loadRestInfo().then(response => {
                const user = JSON.parse(sessionStorage.getItem('sg_user'));
                window.location.href = `${nextUrl}`;
              });
            });
          },
          error => {
            error = error.body;
            let errorMessage =
              'An error occurred while checking your credentials, make sure you have an Elasticsearch cluster secured by Search Guard running.';

            if (error.statusCode && error.statusCode === 401) {
              errorMessage = 'Invalid username or password, please try again';
            } else if (error.statusCode && error.statusCode === 404) {
              // This happens either when the user doesn't have any valid tenants or roles
              errorMessage = error.message;
            }

            this.setState({
              errorMessage,
            });
          }
        );
    } catch (error) {
      this.errorMessage = 'An internal error has occured.';
    }
  };

  render() {
    const { basePath, httpClient } = this.props;
    const {
      showbrandimage: showBrandImage,
      brandimage: brandImage,
      title: loginTitle,
      subtitle: loginSubTitle,
      buttonstyle: buttonStyle,
    } = this.props.basicAuthConfig.login;

    const {
      buttonstyle: alternativeButtonStyle,
      button_text: alternativeButtonLabel,
    } = this.props.basicAuthConfig.alternative_login;

    return (
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}
      >
        <EuiPanel style={{ maxWidth: '350px' }}>
          {showBrandImage ? (
            <div style={{ margin: 'auto', maxWidth: '300px' }}>
              <EuiImage
                data-test-subj="sg.login.brandImage"
                alt="Brand image"
                size="l"
                url={brandImage.startsWith('/plugins') ? basePath + brandImage : brandImage}
              />
            </div>
          ) : (
            <EuiSpacer size="l" />
          )}

          <EuiText textAlign="center" data-test-subj="sg.login.title">
            <h2>{loginTitle}</h2>
          </EuiText>
          <EuiText textAlign="center" data-test-subj="sg.login.subTitle">
            <p>{loginSubTitle}</p>
          </EuiText>

          <LicenseWarningCallout httpClient={httpClient} />

          <form onSubmit={event => event.preventDefault()}>
            <EuiForm>
              <input
                autoComplete="anyrandomstring"
                name="hidden"
                type="text"
                style={{ display: 'none' }}
              />
              <EuiFormRow label="Username" isInvalid={this.state.errorMessage !== null}>
                <EuiFieldText
                  id="sg.username"
                  name="userName"
                  required={true}
                  placeholder="Username"
                  value={this.state.userName}
                  onChange={this.onChange}
                  autoFocus
                  icon="user"
                  autoComplete="off"
                  isInvalid={this.state.errorMessage !== null}
                />
              </EuiFormRow>

              <EuiSpacer />
              <EuiFormRow label="Password" isInvalid={this.state.errorMessage !== null}>
                <EuiFieldPassword
                  id="sg.password"
                  name="password"
                  required={true}
                  placeholder="Password"
                  value={this.state.password}
                  onChange={this.onChange}
                  autoComplete="off"
                  isInvalid={this.state.errorMessage !== null}
                />
              </EuiFormRow>
              <EuiSpacer size="l" />

              <EuiButton
                id="sg.login"
                fill
                fullWidth={true}
                style={buttonStyle}
                onClick={this.handleSubmit}
                type="submit"
              >
                Log in
              </EuiButton>

              {this.state.alternativeLogin && (
                <Fragment>
                  <EuiSpacer size="l" />

                  <EuiButton
                    id="sg.alternative_login"
                    fill
                    fullWidth={true}
                    href={this.state.alternativeLogin.url}
                    style={alternativeButtonStyle}
                  >
                    {alternativeButtonLabel}
                  </EuiButton>
                </Fragment>
              )}
            </EuiForm>
          </form>

          {this.state.errorMessage && (
            <Fragment>
              <EuiSpacer size="l" />
              <EuiCallOut
                id="sg.errorMessage"
                data-test-subj="sg.errorMessage"
                title="Error"
                color="danger"
                iconType="alert"
              >
                <EuiText>
                  <p>{this.state.errorMessage}</p>
                </EuiText>
              </EuiCallOut>
            </Fragment>
          )}
        </EuiPanel>
      </div>
    );
  }
}
