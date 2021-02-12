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

/*
The goals of the new authc design
1. Consolidate the authc code
2. Consolidate the unit test
3. Pass less arguments
4. Mock less in the unit tests
5. Decrease side effects by prefering composition over inheritence
6. Abstract the authc domain selection and have more control by handling all auth modes explicitely
7. Uniform error handling and log
8. Finite-state machine
https://en.wikipedia.org/wiki/Finite-state_machine
https://dev.to/lifelongthinker/the-state-pattern-exemplified-4cbe
*/

import { cloneDeep, get } from 'lodash';
import { BasicDomain, BasicauthDomain, KerberosDomain, ProxyDomain } from './domains';

const AUTH_DOMAINS = {
  basic: 'basic',
  basicauth: 'basicauth',
  kerberos: 'kerberos',
  proxy: 'proxy',
};

const authDomains = new Map([
  [AUTH_DOMAINS.basic, new BasicDomain()],
  [AUTH_DOMAINS.basicauth, new BasicauthDomain()],
  [AUTH_DOMAINS.kerberos, new KerberosDomain()],
  [AUTH_DOMAINS.proxy, new ProxyDomain()],
]);

export function isKerberosAuth(authcHeaders) {
  return authcHeaders.authorization.toLowerCase().startsWith('negotiate');
}

export function isBasicAuth(authcHeaders) {
  return authcHeaders.authorization.toLowerCase().startsWith('basic');
}

export function isProxyAuth(authcHeaders) {
  return (
    authcHeaders.hasOwnProperty('x-proxy-user') && authcHeaders.hasOwnProperty('x-proxy-roles')
  );
}

export class AuthenticationState {
  constructor(args) {
    this.isOk = false;
    this.isRedirected = false;
    this.isUnauthorized = false;
    this.isNotHandled = true;

    for (const [key, value] of Object.entries(args)) {
      this[key] = value;
    }
  }
}

export class UnauthorizedState extends AuthenticationState {
  constructor(state, args = {}) {
    super({ ...cloneDeep(state), ...cloneDeep(args) });
    this.isOk = false;
    this.isRedirected = false;
    this.isUnauthorized = true;
    this.isNotHandled = false;
  }
}

export class NotHandledState extends AuthenticationState {
  constructor(state, args = {}) {
    super({ ...cloneDeep(state), ...cloneDeep(args) });
    this.isOk = false;
    this.isRedirected = false;
    this.isUnauthorized = false;
    this.isNotHandled = true;
  }
}

export class RedirectedState extends AuthenticationState {
  constructor(state, args = {}) {
    super({ ...cloneDeep(state), ...cloneDeep(args) });
    this.isOk = false;
    this.isRedirected = true;
    this.isUnauthorized = false;
    this.isNotHandled = false;
  }
}

export class OkState extends AuthenticationState {
  constructor(state, args = {}) {
    super({ ...cloneDeep(state), ...cloneDeep(args) });
    this.isOk = false;
    this.isRedirected = true;
    this.isUnauthorized = false;
    this.isNotHandled = false;
  }
}

export function debugStateMessage({ error, state, message }) {
  const messageParts = [];
  if (message) messageParts.push(message);
  if (error) messageParts.push(error);

  if (state) {
    const debugState = cloneDeep(state);
    if (get(debugState, 'headers.authorization')) {
      debugState.headers.authorization = '<obfuscated credentials>';
    }
    messageParts.push(JSON.stringify(debugState, null, 2));
  }

  return messageParts.join(', ');
}

export class AuthenticationDomain {
  constructor({ searchGuardBackend, sessionStorage, logger }) {
    this.searchGuardBackend = searchGuardBackend;
    this.sessionStorage = sessionStorage;
    this.logger = logger;
  }

  login(request, authcMethod) {
    if (!authDomains.has(authcMethod.method)) {
      return new RedirectedState(authcMethod, {
        body: {
          message: `Unrecognized authentication domain "${authcMethod.method}"`,
        },
      });
    }

    return authDomains[authcMethod.method].login(request, authcMethod);
  }

  logout(request, authcMethod) {
    if (!authDomains.has(authcMethod.method)) {
      return new RedirectedState(authcMethod, {
        body: {
          message: `Unrecognized authentication domain "${authcMethod.method}"`,
        },
      });
    }

    return authDomains[authcMethod.method].logout(request, authcMethod);
  }

  authenticate(authcHeaders, authcState) {
    if (!authcState.authcMethod) {
      // Select a non-session-based authc domain if any
      if (isBasicAuth(authcHeaders)) {
        authcState.authcMethod = AUTH_DOMAINS.basicauth;
      } else if (isKerberosAuth(authcHeaders)) {
        authcState.authcMethod = AUTH_DOMAINS.kerberos;
      } else if (isProxyAuth(authcHeaders)) {
        authcState.authcMethod = AUTH_DOMAINS.proxy;
      } else {
        return new UnauthorizedState(authcState, {
          body: {
            message: `Unrecognized authentication domain "${authcState.authcMethod}"`,
          },
        });
      }
    }

    return authDomains[authcState.authcMethod].authenticate(authcHeaders, authcState); // return authcState
  }

  async checkAuth(request, response, toolkit) {
    try {
      const cookie = await this.sessionStorage.get();
      let authcState = new NotHandledState(cookie);

      this.logger.debug(
        debugStateMessage({
          state: authcState,
          message: 'Pre authenticate state',
        })
      );

      authcState = await this.authenticate(request.headers, authcState);

      this.logger.debug(
        debugStateMessage({
          state: authcState,
          message: 'Post authenticate state',
        })
      );

      if (authcState.isOk) {
        return toolkit.authenticated({ requestHeaders: authcState.requestHeaders });
      } else if (authcState.isRedirected) {
        return toolkit.redirected({ headers: authcState.headers });
      } else if (authcState.isUnauthorized) {
        this.logger.error(`Unauthorized, ${authcState.body.message}`);
        return response.unauthorized({ headers: authcState.headers, body: authcState.body });
      }
    } catch (error) {
      this.logger(`Fail to verify session, ${error}`);
    }

    this.logger.error('Not handled');
    return toolkit.notHandled();
  }
}
