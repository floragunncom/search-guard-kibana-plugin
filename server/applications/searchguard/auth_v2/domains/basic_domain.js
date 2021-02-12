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

import { SessionBasedDomain } from './session_based_domain';
import { OkState, RedirectedState, UnauthorizedState } from '../authentication_domain';

export class BasicDomain extends SessionBasedDomain {
  async login(authcHeaders, authcMethod) {
    console.log(authcHeaders, authcMethod);

    const cookie = await this.sessionStorage.get();
    let authcState = new UnauthorizedState(cookie, authcMethod);

    authcState = await this.authenticate(authcHeaders, authcState);
    // We don't redirect on the Login page if we are on the Login page
    if (authcState.isRedirected) {
      return new UnauthorizedState(authcState, {
        headers: {},
        body: { message: 'Wrong credentials' },
      });
    }
  }

  async logout(request, authcMethod) {
    console.log(request, authcMethod);

    const authcState = {};
    return new RedirectedState(authcState, {
      headers: {
        location: '/login',
      },
    });
  }

  async authenticate(authcHeaders, authcState) {
    try {
      await super.authenticate(authcHeaders);

      return new OkState(authcHeaders);
    } catch (error) {
      // TODO: renew token
      return new RedirectedState(authcState, {
        headers: {
          location: '/login',
        },
      });
    }
  }
}
