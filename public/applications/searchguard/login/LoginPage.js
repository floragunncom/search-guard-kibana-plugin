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
  const _authTypes = authTypes.filter((authType) => authType.type !== 'basicauth');
  if (!_authTypes.length) return null;

  return (
    <EuiFlexItem>
      <EuiErrorBoundary>
        <EuiFlexGroup direction="column" gutterSize="m" data-test-sub="sg.login.authMenu">
          {_authTypes.map((auth, index) => {
            return (
              <EuiFlexItem key={index} style={{ minWidth: 400 }}>
                <EuiErrorBoundary>
                  <EuiCard
                    key={index}
                    data-test-subj={`sg.login.authMenu.item.openid`}
                    layout="horizontal"
                    paddingSize="s"
                    icon={<EuiIcon size="xl" type="empty" />}
                    title={auth.title}
                    description=""
                    href={auth.loginURL}
                  />
                </EuiErrorBoundary>
              </EuiFlexItem>
            );
          })}
        </EuiFlexGroup>
      </EuiErrorBoundary>
    </EuiFlexItem>
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

export function BasicLogin({ httpClient, basicLoginConfig, loginPageConfig }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!basicLoginConfig) return null;

  const loginButtonStyles = stringCSSToReactStyle(loginPageConfig.buttonstyle);

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
    <EuiFlexItem>
      <EuiErrorBoundary>
        <EuiPanel grow={false} style={{ maxWidth: 400 }}>
          <EuiFlexGroup direction="column">
            <EuiFlexItem>
              <HTMLTitle
                HTMLTag="p"
                text={basicLoginConfig.message}
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

                </EuiForm>
              </form>
            </EuiFlexItem>
            <ErrorCallout error={error} />
          </EuiFlexGroup>
        </EuiPanel>
      </EuiErrorBoundary>
    </EuiFlexItem>
  );
}

export function BrandImage({ configService, httpClient }) {
  const { showbrandimage: showBrandImage, brandimage: brandImage } = configService.get(
    'searchguard.login'
  );

  if (!showBrandImage) return null;
  return (
    <EuiFlexItem>
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
    </EuiFlexItem>
  );
}

export function authTypesToUiAuthTypes(authTypes, { basePath = '' } = {}) {
  return authTypes.map((authType) => {
    return {
      ...authType, loginURL: extendLoginURL(authType.loginURL)
    };
  });

  function extendLoginURL(loginURL) {
    if (!loginURL) loginURL = basePath + '/login';
    const currURL = new URL(window.location.href);

    try {
      loginURL = new URL(loginURL);
    } catch (error) {
      loginURL = new URL(loginURL, 'http://sgurlplaceholder');
    }

    let nextURL = currURL.searchParams.get('nextUrl');
    if (nextURL) {
      if (currURL.hash) nextURL += currURL.hash;
      loginURL.searchParams.set('nextUrl', nextURL);
    }

    if (loginURL.hostname.startsWith('sgurlplaceholder')) {
      return loginURL.pathname + loginURL.search;
    }

    return loginURL.toString();
  }
}

export function LoginPage({ httpClient, configService }) {
  const [loginPageConfig, setLoginPageConfig] = useState({});
  const [authTypes, setAuthTypes] = useState([]);
  const [basicLoginConfig, setBasicLoginConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  async function fetchData() {
    setError(null);
    setIsLoading(true);

    // if session was not terminated by logout, clear any remaining
    // stored paths etc. from previous users, to avoid issues
    // like a non-working default index pattern
    localStorage.clear();
    sessionStorage.clear();

    try {
      const { data } = await httpClient.get(`${API_ROOT}/auth/config`);
      let authTypes = data.authTypes;
      authTypes = authTypesToUiAuthTypes(authTypes, httpClient.http.basePath.basePath);
      console.debug('LoginPage, fetchData, authTypes', authTypes);
      setLoginPageConfig(data.loginPage);
      setAuthTypes(authTypes);
      setBasicLoginConfig(authTypes.find(({ type }) => type === 'basicauth'));
    } catch (error) {
      console.error('LoginPage, fetchData', error);
      setError(error.message);
    }

    setIsLoading(false);
  }

  return (
    <div style={{ padding: 100 }}>
      <EuiFlexGroup direction="column" alignItems="center" justifyContent="center">
        <BrandImage configService={configService} httpClient={httpClient} />
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
              <BasicLogin
                basicLoginConfig={basicLoginConfig}
                configService={configService}
                httpClient={httpClient}
                loginPageConfig={loginPageConfig}
              />
              <AuthTypesMenu authTypes={authTypes} />
            </EuiFlexGroup>
          )}
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
}
