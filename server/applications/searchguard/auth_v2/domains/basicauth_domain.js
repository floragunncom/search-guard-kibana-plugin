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

import { Domain } from './domain';
import { unauthorizedState, okState } from '../authentication_domain';

export class BasicauthDomain extends Domain {
  async authenticate(authcHeaders, authcState) {
    try {
      await super.authenticate(authcHeaders);

      return okState(authcState);
    } catch (error) {
      return unauthorizedState(authcState, {
        headers: {
          ['WWW-Authenticate']: 'Basic realm="Authorization Required"',
        },
      });
    }
  }
}
