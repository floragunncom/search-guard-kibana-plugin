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
    <EuiFormRow id="sp.username" label="Username" isInvalid={isInvalid} fullWidth>
      <EuiFieldText
        id="sp.username"
        data-test-subj="sp.username"
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
    <EuiFormRow id="sp.password" label="Password" isInvalid={isInvalid} fullWidth>
      <EuiFieldPassword
        id="sp.password"
        data-test-subj="sp.password"
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
          id="sp.errorMessage"
          data-test-subj="sp.errorMessage"
          title="Error"
          color="danger"
          iconType="alert"
        >
          <EuiText data-test-subj="sp.errorMessage-text">
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
    <EuiFlexItem style={{ minWidth: 350, maxWidth: 350 }}>
	<EuiPanel>
      <EuiErrorBoundary>
        <EuiFlexGroup direction="column" gutterSize="xl" responsive={false} wrap data-test-sub="sp.login.authMenu">
          {_authTypes.map((auth, index) => {
            return (
              <EuiFlexItem key={index} grow={false}>
                <EuiErrorBoundary>
                  <EuiFlexGroup direction="column" gutterSize="m" responsive={false} wrap>
                    <EuiButton
                      key={index}
                      data-test-subj={`sp.login.authMenu.item.${auth.type}`}
                      href={auth.loginURL}
                      isDisabled={auth.unavailable}
                    >
                      {auth.title}
                    </EuiButton>
					{auth.unavailable && (auth.message_title || auth.message_body) ?
					 <EuiCallOut title={auth.message_title} color="danger" iconType="alert">
			            <p style={{fontSize: "12px"}}>{auth.message_body}</p>
						{auth.details ? (<textarea style={{height: "3.6em", width: "100%", fontSize: "9px", border: "none"}}>{JSON.stringify(auth.details)}</textarea>) : null}
			         </EuiCallOut>
					: null}
				  </EuiFlexGroup>
                </EuiErrorBoundary>
              </EuiFlexItem>
            );
          })}
        </EuiFlexGroup>
      </EuiErrorBoundary>
	</EuiPanel>
    </EuiFlexItem>
  );
}

export function DebugTable({debugInfo = []}) {
	if (!debugInfo || debugInfo.length == 0) {
		return null;
	}

	return (
    <EuiErrorBoundary>
      <EuiCallOut title="Debug Information" color="warning" iconType="help">
        <table style={{width: "60vw"}}>
          {debugInfo.map((row, index) => {
	        return (
		      <tr style={{borderBottom:"1px solid #8a6a0a"}}>
                <td style={{width:"10ex", padding:"0 1ex", verticalAlign:"top"}}><div style={{width:"10ex", overflow:"hidden"}}>{row.method}</div></td>
                <td style={{width:"8ex", padding:"0 1ex", verticalAlign:"top"}}>{row.success ? "success" : "fail"}</td>
                <td style={{width:"40%", padding:"0 1ex", verticalAlign:"top"}}>{row.message}</td>
                <td style={{padding:"0 1ex", verticalAlign:"top", width:"40%"}}>{row.details ? (<textarea style={{height: "3.6em", width: "100%", fontSize: "9px", border: "none"}}>{JSON.stringify(row.details)}</textarea>) : null}</td>
              </tr>
	        );
          })}
        </table>
      </EuiCallOut>
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

export function BasicLogin({ httpClient, basicLoginConfig, loginPageConfig, setDebugInfo }) {
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
      await httpClient.post(`${API_ROOT}/auth/login`, { username, password }, { asResponse: true });
      redirectToKibana();
    } catch (error) {
      console.error('BasicLogin, handleSubmit', error);
	  if (error.body) {
		console.log(JSON.stringify(error.body));
	  }
      let _error =
        'An error occurred while checking your credentials, make sure you have an OpenSearch cluster secured by Eliatra Suite Security Plus running.';

      if (error.body?.message) {
        _error = error.body.message;
      }

      if (error.body?.attributes?.error) {
        _error = error.body.attributes.error;
      }

      if (_error == "Authentication failed") {
	    _error = "Invalid username or password, please try again";
      }

      setError(_error);

      if (error.body?.attributes?.debug && setDebugInfo) {
	    setDebugInfo(error.body.attributes.debug);
	  }

    }

    setIsLoading(false);
  }

  return (
    <EuiFlexItem style={{ minWidth: 350, maxWidth: 350 }}>
      <EuiErrorBoundary>
        <EuiPanel grow={false}>
          <EuiFlexGroup direction="column">
            <EuiFlexItem>
              <HTMLTitle
                HTMLTag="div"
                text={basicLoginConfig.message_body}
                euiTextProps={{ 'data-test-subj': 'sp.login.subTitle', size: 'xs' }}
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
                    id="sp.login"
                    data-test-subj="sp.login"
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

export function BrandImage({ loginPageConfig, httpClient }) {
  const { show_brand_image: showBrandImage, brand_image: brandImage } = loginPageConfig;

  if (!showBrandImage || !brandImage) return null;
  return (
    <EuiErrorBoundary>
      <div style={{ maxWidth: 100 }}>
        <EuiImage
          data-test-subj="sp.login.brandImage"
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
  const [debugInfo, setDebugInfo] = useState(null);

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

	  const errorMessage = getErrorInfoFromCookie("sp_err");

      if (errorMessage) {
	  	setError(errorMessage);
	  }

      const debugInfo = getErrorInfoFromCookie("sp_dbg");

      if (debugInfo) {
	     try {
	       setDebugInfo(JSON.parse(debugInfo));
         } catch (e) {
	       setDebugInfo([debugInfo]);
         }
      }

    } catch (error) {
      console.error('LoginPage, fetchData', error);
      setError(error.message);
    }

    setIsLoading(false);
  }

  function getErrorInfoFromCookie(cookieName) {
	const errorParam = new URL(location.href).searchParams.get("err");

	if (!errorParam) {
		return undefined;
	}

	const errorCookie = document.cookie.split(/\s*;\s*/).find(row => row.startsWith(cookieName + '='));

	if (errorCookie && errorCookie.length > 7) {
		document.cookie = cookieName + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
		return decodeURIComponent(errorCookie.substring(cookieName.length + 1));
	} else {
		return "The login failed. Please try again later or contact your system adminstrator if the problem persists.";
	}
  }

  return (
      <EuiFlexGroup direction="column" alignItems="center" style={{ padding: '100px 10px' }}>
        <EuiFlexItem  grow={false}>
          <BrandImage loginPageConfig={loginPageConfig} httpClient={httpClient} />
        </EuiFlexItem>
        <EuiFlexItem  grow={false}>
          <HTMLTitle
            HTMLTag="h2"
            text={loginPageConfig.title}
            euiTextProps={{ 'data-test-subj': 'sp.login.title' }}
          />
        </EuiFlexItem>
        <ErrorCallout grow={false} error={error} euiFlexItemProps={{ style: { minWidth: 350 }, grow: false }} />
        <LicenseWarningCallout
          configService={configService}
          euiFlexItemProps={{ style: { minWidth: 350 } }}
        />
        <EuiFlexItem  grow={false}>
          {isLoading ? (
            <EuiLoadingKibana size="xl" />
          ) : (
            <EuiFlexGroup gutterSize="m" direction="column">
              <BasicLogin
                basicLoginConfig={basicLoginConfig}
                configService={configService}
                httpClient={httpClient}
                loginPageConfig={loginPageConfig}
                setDebugInfo={setDebugInfo}
              />
              <AuthTypesMenu authTypes={authTypes} />
            </EuiFlexGroup>
          )}
        </EuiFlexItem>
        <EuiFlexItem  grow={false}>
		  <DebugTable debugInfo={debugInfo}/>
		</EuiFlexItem>
      </EuiFlexGroup>
  );
}
