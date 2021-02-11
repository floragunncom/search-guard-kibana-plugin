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
2. Consolidate the unit tests
3. Pass less arguments
4. Mock less in the unit tests
5. Decrease side effects by prefering composition over inheritence
6. Abstract the authc domain selection and have more control by handling all auth modes explicitely
7. Finite-state machine
https://en.wikipedia.org/wiki/Finite-state_machine
https://dev.to/lifelongthinker/the-state-pattern-exemplified-4cbe
*/

import { cloneDeep } from 'lodash';
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

// It will be a class in TypeScript
export function unauthorizedState(state, args = {}) {
  return {
    ...cloneDeep(state),
    ...cloneDeep(args),
    isOk: false,
    isRedirected: false,
    isUnauthorized: true,
    isNotHandled: false,
  };
}

// It will be a class in TypeScript
export function redirectedState(state, args = {}) {
  return {
    ...cloneDeep(state),
    ...cloneDeep(args),
    isOk: false,
    isRedirected: true,
    isUnauthorized: false,
    isNotHandled: false,
  };
}

// It will be a class in TypeScript
export function okState(state, args = {}) {
  return {
    ...cloneDeep(state),
    ...cloneDeep(args),
    isOk: true,
    isRedirected: false,
    isUnauthorized: false,
    isNotHandled: false,
  };
}

// It will be a class in TypeScript
export function notHandledState(state, args = {}) {
  return {
    ...cloneDeep(state),
    ...cloneDeep(args),
    isOk: false,
    isRedirected: false,
    isUnauthorized: false,
    isNotHandled: true,
  };
}

export class AuthenticationDomain {
  constructor({ searchGuardBackend, sessionStorage, logger }) {
    this.searchGuardBackend = searchGuardBackend;
    this.sessionStorage = sessionStorage;
    this.logger = logger;
  }

  login(request, authcMethod) {
    if (!authDomains.has(authcMethod.method)) {
      return redirectedState(authcMethod, {
        body: {
          message: `Unrecognized authentication domain "${authcMethod.method}"`,
        },
      });
    }

    return authDomains[authcMethod.method].login(request, authcMethod);
  }

  logout(request, authcMethod) {
    if (!authDomains.has(authcMethod.method)) {
      return redirectedState(authcMethod, {
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
        return unauthorizedState(authcState, {
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
      let authcState = await this.sessionStorage.get();
      // TODO: do not expose credentials
      this.logger.debug(`Pre authenticate authcState ${JSON.stringify(authcState, null, 2)}`);

      authcState = await this.authenticate(request.headers, authcState);
      // TODO: do not expose credentials
      this.logger.debug(`Post authenticate authcState ${JSON.stringify(authcState, null, 2)}`);

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
