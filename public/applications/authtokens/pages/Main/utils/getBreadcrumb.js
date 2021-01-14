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

import queryString from 'query-string';
import {
  authTokensText,
  createAuthTokenText,
  authTokenText,
} from '../../../utils/i18n/auth_tokens';
import { homeText } from '../../../utils/i18n/common';
import { APP_PATH, AUTH_TOKEN_ACTIONS } from '../../../utils/constants';

export default function getBreadcrumb(route) {
  const [base, queryParams] = route.split('?');
  if (!base) return null;

  const { id, action } = queryString.parse(queryParams);
  const urlParams = id && action ? `?id=${id}&action=${action}` : '';
  const readAuthToken = action === AUTH_TOKEN_ACTIONS.READ_TOKEN;

  const removePrefixSlash = (path) => path.slice(1);
  const breadcrumb = {
    '#': { text: homeText, href: APP_PATH.HOME },
    [removePrefixSlash(APP_PATH.AUTH_TOKENS)]: {
      text: authTokensText,
      href: APP_PATH.AUTH_TOKENS,
    },
    [removePrefixSlash(APP_PATH.CREATE_AUTH_TOKEN)]: [
      { text: authTokensText, href: APP_PATH.AUTH_TOKENS },
      {
        text: readAuthToken ? authTokenText : createAuthTokenText,
        href: APP_PATH.CREATE_AUTH_TOKEN + urlParams,
      },
    ],
  }[base];

  return breadcrumb;
}
