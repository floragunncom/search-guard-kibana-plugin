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
import { getResourceEditUri, getResourceReadUri } from './helpers';

describe('Accounts/helpers', () => {
  test('getResourceEditUri', () => {
    expect(getResourceEditUri('a b', 'email')).toBe('/define-account?id=a%20b&accountType=email');
  });

  test('getResourceReadUri', () => {
    expect(getResourceReadUri('a b', 'email')).toBe(
      '/define-json-account?id=a%20b&accountType=email&action=read-account'
    );
  });
});
