/*
 *    Copyright 2021 floragunn GmbH
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

import React, { useState, useEffect } from 'react';
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
  EuiErrorBoundary,
  EuiLoadingKibana,
} from '@elastic/eui';
import { LicenseWarningCallout } from '../../components';
import { stringCSSToReactStyle } from '../../../utils/cssHelper';

import { API_ROOT } from '../../../utils/constants';

// @todo Move this to the new app
import { sanitizeNextUrlFromFullUrl } from './sanitize_next_url';

export function isInvalid(error) {
  return error !== null;
}

export function UserNameInput({ isInvalid, userName, onChange }) {
  return (
    <EuiFormRow id="sg.username" label="Username" isInvalid={isInvalid}>
      <EuiFieldText
        id="sg.username"
        data-test-subj="sg.username"
        name="userName"
        required={true}
        placeholder="Username"
        value={userName}
        onChange={onChange}
        autoFocus
        icon="user"
        autoComplete="off"
        isInvalid={isInvalid}
      />
    </EuiFormRow>
  );
}

export function UserPasswordInput({ isInvalid, password, onChange }) {
  return (
    <EuiFormRow id="sg.password" label="Password" isInvalid={isInvalid}>
      <EuiFieldPassword
        id="sg.password"
        data-test-subj="sg.password"
        name="password"
        required={true}
        placeholder="Password"
        value={password}
        onChange={onChange}
        autoComplete="off"
        isInvalid={isInvalid}
      />
    </EuiFormRow>
  );
}

export function AlternativeLoginButton({ alternativeLoginConfig }) {
  const alternativeLogin = getAlternativeLogin(alternativeLoginConfig);
  if (!alternativeLogin) return null;

  const alternativeLoginButtonStyles = stringCSSToReactStyle(alternativeLoginConfig.buttonstyle);
  const { button_text: alternativeButtonLabel } = alternativeLoginConfig;

  function getAlternativeLogin(alternativeLoginConfig) {
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

  return (
    <EuiErrorBoundary>
      <EuiButton
        id="sg.alternative_login"
        data-test-subj="sg.alternative_login"
        fill
        fullWidth={true}
        href={alternativeLogin.url}
        style={alternativeLoginButtonStyles}
      >
        {alternativeButtonLabel}
      </EuiButton>
    </EuiErrorBoundary>
  );
}

export function ErrorCallout({ error, euiFlexItemProps = {} } = {}) {
  if (!error) return null;

  return (
    <EuiFlexItem {...euiFlexItemProps}>
      <EuiErrorBoundary>
        <EuiCallOut
          id="sg.errorMessage"
          data-test-subj="sg.errorMessage"
          title="Error"
          color="danger"
          iconType="alert"
        >
          <EuiText data-test-subj="sg.errorMessage-text">
            <p>{error}</p>
          </EuiText>
        </EuiCallOut>
      </EuiErrorBoundary>
    </EuiFlexItem>
  );
}

export function AuthTypesMenu({ authTypes = [] }) {
  const _authTypes = authTypes.filter((authType) => authType.title !== 'basicauth');
  if (!_authTypes.length) return null;

  return (
    <EuiErrorBoundary>
      <EuiFlexGroup direction="column" gutterSize="m">
        {_authTypes.map((auth, index) => (
          <EuiFlexItem key={index} style={{ maxWidth: 400 }}>
            <EuiErrorBoundary>
              <EuiCard
                key={index}
                layout="horizontal"
                paddingSize="s"
                icon={<EuiIcon size="xl" type="empty" />}
                title={auth.title}
                description={auth.description}
                href={auth.loginURL}
              />
            </EuiErrorBoundary>
          </EuiFlexItem>
        ))}
      </EuiFlexGroup>
    </EuiErrorBoundary>
  );
}

export function HTMLTitle({ text, euiTextProps = {}, HTMLTag = 'h1' } = {}) {
  return (
    <EuiErrorBoundary>
      <EuiText textAlign="center" {...euiTextProps}>
        <HTMLTag
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: dompurify.sanitize(text) }}
        />
      </EuiText>
    </EuiErrorBoundary>
  );
}

export function BasicLogin({ configService, httpClient, isEnabled }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isEnabled) return null;

  const loginPageConfig = configService.get('searchguard.login');
  const loginButtonStyles = stringCSSToReactStyle(loginPageConfig.buttonstyle);
  const alternativeLoginConfig = configService.get('searchguard.basicauth.alternative_login');

  function redirectToKibana() {
    const nextUrl = sanitizeNextUrlFromFullUrl(
      window.location.href,
      httpClient.http.basePath.basePath
    );
    window.location.href = nextUrl;
  }

  async function handleSubmit() {
    setError(null);
    setIsLoading(true);

    try {
      await httpClient.post(`${API_ROOT}/auth/login`, { username, password });
      redirectToKibana();
    } catch (error) {
      console.error('BasicLogin, handleSubmit', error);

      let _error =
        'An error occurred while checking your credentials, make sure you have an Elasticsearch cluster secured by Search Guard running.';
      if (error.body) error = error.body;

      if (error.statusCode && error.statusCode === 401) {
        _error = 'Invalid username or password, please try again';
      } else if (error.statusCode && error.statusCode === 404) {
        // This happens either when the user doesn't have any valid tenants or roles
        _error = error.message;
      }

      setError(_error);
    }

    setIsLoading(false);
  }

  return (
    <EuiErrorBoundary>
      <EuiPanel grow={false} style={{ maxWidth: 400 }}>
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <HTMLTitle
              HTMLTag="p"
              text={loginPageConfig.subtitle}
              euiTextProps={{ 'data-test-subj': 'sg.login.subTitle' }}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <form onSubmit={(event) => event.preventDefault()}>
              <EuiForm>
                <input
                  autoComplete="anyrandomstring"
                  name="hidden"
                  type="text"
                  style={{ display: 'none' }}
                />
                <UserNameInput
                  isInvalid={isInvalid(error)}
                  userName={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <EuiSpacer />

                <UserPasswordInput
                  isInvalid={isInvalid(error)}
                  password={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <EuiSpacer size="l" />

                <EuiButton
                  id="sg.login"
                  data-test-subj="sg.login"
                  fill
                  fullWidth={true}
                  style={loginButtonStyles}
                  onClick={handleSubmit}
                  type="submit"
                  isLoading={isLoading}
                >
                  Log in
                </EuiButton>

                <AlternativeLoginButton alternativeLoginConfig={alternativeLoginConfig} />
              </EuiForm>
            </form>
          </EuiFlexItem>
          <ErrorCallout error={error} />
        </EuiFlexGroup>
      </EuiPanel>
    </EuiErrorBoundary>
  );
}

export function BrandImage({ configService, httpClient }) {
  const { showbrandimage: showBrandImage, brandimage: brandImage } = configService.get(
    'searchguard.login'
  );

  if (!showBrandImage) return null;
  return (
    <EuiErrorBoundary>
      <div style={{ maxWidth: '300px' }}>
        <EuiImage
          data-test-subj="sg.login.brandImage"
          alt="Brand image"
          size="fullWidth"
          url={
            brandImage.startsWith('/plugins')
              ? httpClient.http.basePath.basePath + brandImage
              : brandImage
          }
        />
      </div>
    </EuiErrorBoundary>
  );
}

export function LoginPage({ httpClient, configService }) {
  const [authTypes, setAuthTypes] = useState([]);
  const [isBasicLogin, setIsBasicLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginPageConfig = configService.get('searchguard.login');

  async function fetchData() {
    setError(null);
    setIsLoading(true);

    // if session was not terminated by logout, clear any remaining
    // stored paths etc. from previous users, to avoid issues
    // like a non-working default index pattern
    localStorage.clear();
    sessionStorage.clear();

    try {
      const { data: authTypes } = await httpClient.get(`${API_ROOT}/auth/types`);

      setAuthTypes(authTypes);
      setIsBasicLogin(authTypes.some(({ title }) => title === 'basicauth'));
    } catch (error) {
      console.error('LoginPage, fetchData', error);
      setError(error.message);
    }

    setIsLoading(false);
  }

  return (
    <div style={{ padding: 100 }}>
      <EuiFlexGroup direction="column" alignItems="center" justifyContent="center">
        <EuiFlexItem>
          <BrandImage configService={configService} httpClient={httpClient} />
        </EuiFlexItem>
        <EuiFlexItem>
          <HTMLTitle
            HTMLTag="h2"
            text={loginPageConfig.title}
            euiTextProps={{ 'data-test-subj': 'sg.login.title' }}
          />
        </EuiFlexItem>
        <ErrorCallout error={error} euiFlexItemProps={{ style: { minWidth: 400 } }} />
        <LicenseWarningCallout
          configService={configService}
          euiFlexItemProps={{ style: { minWidth: 400 } }}
        />
        <EuiFlexItem>
          {isLoading ? (
            <EuiLoadingKibana size="xl" />
          ) : (
            <EuiFlexGroup gutterSize="m">
              <EuiFlexItem>
                <BasicLogin
                  isEnabled={isBasicLogin}
                  configService={configService}
                  httpClient={httpClient}
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <AuthTypesMenu authTypes={authTypes} />
              </EuiFlexItem>
            </EuiFlexGroup>
          )}
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
}
