/*
 *    Copyright 2026 floragunn GmbH
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

import { toStoredProxy, withStoredProxy } from './storedProxy';

describe('toStoredProxy', () => {
  test.each([
    ['stored proxy id', 'smops-proxy-connector', 'smops-proxy-connector'],
    ['none keyword', 'none', 'none'],
    ['inline URL is trimmed', '  http://proxy:3128 ', 'http://proxy:3128'],
  ])('keeps %s', (_, proxy, expected) => {
    expect(toStoredProxy(proxy)).toBe(expected);
  });

  test.each([
    ['empty', ''],
    ['blank', '  '],
    ['undefined', undefined],
    ['default keyword', 'default'],
    ['default keyword in upper case', 'DEFAULT'],
  ])('omits %s', (_, proxy) => {
    expect(toStoredProxy(proxy)).toBeUndefined();
  });
});

describe('withStoredProxy', () => {
  test('sets the stored proxy', () => {
    expect(withStoredProxy({ name: 'a', proxy: ' none ' })).toEqual({ name: 'a', proxy: 'none' });
  });

  test('removes an omitted proxy', () => {
    expect(withStoredProxy({ name: 'a', proxy: 'default' })).toEqual({ name: 'a' });
    expect(withStoredProxy({ name: 'a' })).toEqual({ name: 'a' });
  });
});
