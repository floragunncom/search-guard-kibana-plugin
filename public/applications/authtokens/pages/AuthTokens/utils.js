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

import moment from 'moment';
import { APP_PATH, AUTH_TOKEN_ACTIONS } from '../../utils/constants';

export function toHumanDate(unixDate) {
  return moment(unixDate).format('YYYY-MM-DDTHH:mm');
}

export const getResourceEditUri = (name) =>
  `${APP_PATH.CREATE_AUTH_TOKEN}?id=${encodeURIComponent(name)}&action=${
    AUTH_TOKEN_ACTIONS.READ_TOKEN
  }`;

export function tokensToUiTokens(resources = []) {
  const tokens = [];
  const revokedTokens = [];

  for (const token of resources) {
    if (Number.isFinite(token.revoked_at)) {
      revokedTokens.push(token);
    } else {
      tokens.push(token);
    }
  }

  return { tokens, revokedTokens };
}
