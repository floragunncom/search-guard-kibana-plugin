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

import React, { Component, Fragment } from 'react';
import dompurify from 'dompurify';
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
  EuiCard,
  EuiIcon,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import { LicenseWarningCallout } from '../../components';
import { stringCSSToReactStyle } from '../../../utils/cssHelper';

import { API_ROOT } from '../../../utils/constants';

// @todo Move this to the new app
import { sanitizeNextUrlFromFullUrl } from './sanitize_next_url';

export class LoginPage extends Component {
  constructor(props) {
    super(props);

    // if session was not terminated by logout, clear any remaining
    // stored paths etc. from previous users, to avoid issues
    // like a non-working default index pattern
    localStorage.clear();
    sessionStorage.clear();

    const { configService } = props;

    this.basicAuthConfig = configService.get('searchguard.basicauth');
    this.loginButtonStyles = stringCSSToReactStyle(
      configService.get('searchguard.basicauth.login.buttonstyle')
    );
    this.alternativeLoginButtonStyles = stringCSSToReactStyle(
      configService.get('searchguard.basicauth.alternative_login.buttonstyle')
    );

    // Custom styling
    this.state = {
      userName: '',
      password: '',
      alternativeLogin: this.getAlternativeLogin(this.basicAuthConfig.alternative_login),
      errorMessage: null,
    };
  }

  getAlternativeLogin(alternativeLoginConfig) {
    // Prepare alternative login for the view
    let alternativeLogin = null;

    if (alternativeLoginConfig.show_for_parameter) {
      // Build an object from the query parameters
      // Strip the first ? from the query parameters, if we have any
      const queryString = window.location.search.trim().replace(/^(\?)/, '');
      const queryObject = {};
      if (queryString) {
        queryString.split('&').map((parameter) => {
          const parameterParts = parameter.split('=');
          if (parameterParts[1]) {
            queryObject[encodeURIComponent(parameterParts[0])] = parameterParts[1];
          }
        });
      }

      const alternativeLoginURL = queryObject[alternativeLoginConfig.show_for_parameter];
      let validRedirect = false;

      try {
        alternativeLoginConfig.valid_redirects.forEach((redirect) => {
          if (new RegExp(redirect).test(alternativeLoginURL)) {
            validRedirect = true;
          }
        });
      } catch (error) {
        console.warn('LoginPage, getAlternativeLogin', error);
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
  onChange = (event) => {
    const { name, value } = event.target;

    this.setState({
      [name]: value,
    });
  };

  handleSubmit = async () => {
    const { httpClient, basePath } = this.props;
    this.setState({
      errorMessage: null,
    });

    try {
      const nextUrl = sanitizeNextUrlFromFullUrl(window.location.href, basePath);

      httpClient
        .post(`${API_ROOT}/auth/login`, {
          username: this.state.userName,
          password: this.state.password,
        })
        .then(
          () => {
            window.location.href = nextUrl;
          },
          (error) => {
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

  renderAdditionalAuthTypes(authTypes) {
    const { basePath } = this.props;

    return (
      <Fragment>
        {authTypes.map((authType, index) => (
          <EuiCard
            key={index}
            layout="horizontal"
            icon={
              <EuiIcon
                size="xl"
                type={basePath + 'plugins/searchguard/assets/openid-icon-100x100.png'}
              />
            }
            title={authType.title}
            description={authType.description}
            href={authType.loginURL}
          />
        ))}
      </Fragment>
    );
  }

  render() {
    const { basePath, configService } = this.props;
    const additionalAuthTypes = this.props.authTypes.filter((authType) => authType.title !== 'basicauth');

    const {
      showbrandimage: showBrandImage,
      brandimage: brandImage,
      title: loginTitle,
      subtitle: loginSubTitle,
    } = this.basicAuthConfig.login;

    const { button_text: alternativeButtonLabel } = this.basicAuthConfig.alternative_login;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        {showBrandImage ? (
          <div style={{ maxWidth: '300px' }}>
            <EuiImage
              data-test-subj="sg.login.brandImage"
              alt="Brand image"
              size="fullWidth"
              url={brandImage.startsWith('/plugins') ? basePath + brandImage : brandImage}
            />
          </div>
        ) : (
          <EuiSpacer size="l" />
        )}

        <EuiText textAlign="center" data-test-subj="sg.login.title">
          <h2
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: dompurify.sanitize(loginTitle) }}
          />
        </EuiText>

        <EuiSpacer size="l" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EuiFlexGroup style={{ margin: '0 auto' }}>
            {this.props.authTypes.find((type) => type.title === 'basicauth') && (
              <EuiFlexItem grow={false} style={{ alignItems: 'center' }}>
                <EuiPanel grow={false} style={{ maxWidth: '350px' }}>
                  <EuiText textAlign="center" data-test-subj="sg.login.subTitle">
                    <p
                      // eslint-disable-next-line react/no-danger
                      dangerouslySetInnerHTML={{ __html: dompurify.sanitize(loginSubTitle) }}
                    />
                  </EuiText>

                  <LicenseWarningCallout configService={configService} />

                  <form onSubmit={(event) => event.preventDefault()}>
                    <EuiForm>
                      <input
                        autoComplete="anyrandomstring"
                        name="hidden"
                        type="text"
                        style={{ display: 'none' }}
                      />
                      <EuiFormRow
                        id="sg.username"
                        label="Username"
                        isInvalid={this.state.errorMessage !== null}
                      >
                        <EuiFieldText
                          id="sg.username"
                          data-test-subj="sg.username"
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
                      <EuiFormRow
                        id="sg.password"
                        label="Password"
                        isInvalid={this.state.errorMessage !== null}
                      >
                        <EuiFieldPassword
                          id="sg.password"
                          data-test-subj="sg.password"
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
                        data-test-subj="sg.login"
                        fill
                        fullWidth={true}
                        style={this.loginButtonStyles}
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
                            data-test-subj="sg.alternative_login"
                            fill
                            fullWidth={true}
                            href={this.state.alternativeLogin.url}
                            style={this.alternativeLoginButtonStyles}
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
                        <EuiText data-test-subj="sg.errorMessage-text">
                          <p>{this.state.errorMessage}</p>
                        </EuiText>
                      </EuiCallOut>
                    </Fragment>
                  )}
                </EuiPanel>
              </EuiFlexItem>
            )}
            {additionalAuthTypes.length > 0 && (
              <EuiFlexItem style={{ alignItems: 'center' }}>
                <div style={{ maxWidth: '350px' }}>
                  {this.renderAdditionalAuthTypes(
                    this.props.authTypes.filter((authType) => authType.title !== 'basicauth')
                  )}
                </div>
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        </div>
      </div>
    );
  }
}
