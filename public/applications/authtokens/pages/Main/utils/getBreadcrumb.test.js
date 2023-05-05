/** @jest-environment jsdom */

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

import getBreadcrumb from './getBreadcrumb';
import { homeText } from '../../../utils/i18n/common';
import {
  authTokensText,
  createAuthTokenText,
  authTokenText,
} from '../../../utils/i18n/auth_tokens';

describe('getBreadcrumb', () => {
  test('#', () => {
    expect(getBreadcrumb('#')).toEqual({
      href: '/',
      text: homeText,
    });
  });

  test('auth-tokens', () => {
    expect(getBreadcrumb('auth-tokens')).toEqual({
      href: '/auth-tokens',
      text: authTokensText,
    });
  });

  test('create-auth-token', () => {
    expect(getBreadcrumb('create-auth-token')).toEqual([
      {
        href: '/auth-tokens',
        text: authTokensText,
      },
      {
        href: '/create-auth-token',
        text: createAuthTokenText,
      },
    ]);
  });

  test('create-auth-token?id=YDe5owk4Sc2pHnkcdcKBEw&action=read-auth-token', () => {
    expect(
      getBreadcrumb('create-auth-token?id=YDe5owk4Sc2pHnkcdcKBEw&action=read-auth-token')
    ).toEqual([
      {
        href: '/auth-tokens',
        text: authTokensText,
      },
      {
        href: '/create-auth-token?id=YDe5owk4Sc2pHnkcdcKBEw&action=read-auth-token',
        text: authTokenText,
      },
    ]);
  });
});
