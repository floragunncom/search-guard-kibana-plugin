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

import getCurrentAccount from './getCurrentAccount';

describe('getCurrentAccount', () => {
  test('can return action account', () => {
    const allAccounts = [{ _id: '123' }];
    const account = [{ label: '123' }];

    expect(getCurrentAccount(allAccounts, account)).toEqual({ _id: '123' });
  });

  test('return undefined if no current account', () => {
    const allAccounts = [{ _id: '123' }];
    const account = [];

    expect(getCurrentAccount(allAccounts, account)).toEqual(undefined);
  });
});
