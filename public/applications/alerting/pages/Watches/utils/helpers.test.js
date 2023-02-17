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

import { WATCH_TYPES } from '../../DefineWatch/utils/constants';
import { getResourceEditUri, getResourceReadUri, getWatchRelatedAlertsUri, isJsonWatch } from './helpers';

describe('Watches/helpers', () => {
  test('getResourceEditUri', () => {
    expect(getResourceEditUri({ _id: 'a b' })).toBe('/define-json-watch?id=a%20b');
    expect(getResourceEditUri({ _id: 'a b', _ui: { watchType: WATCH_TYPES.GRAPH } })).toBe(
      '/define-watch?id=a%20b'
    );
    expect(getResourceEditUri({ _id: 'a b', _ui: { watchType: WATCH_TYPES.BLOCKS } })).toBe(
      '/define-watch?id=a%20b'
    );
  });

  test('getResourceReadUri', () => {
    expect(getResourceReadUri({ _id: 'a b' })).toBe(
      '/define-json-watch?id=a%20b&action=read-watch'
    );
  });

  test('getWatchRelatedAlertsUri', () => {
    expect(getWatchRelatedAlertsUri('a b')).toBe('/alerts?watchId=a%20b');
  });

  test('isJsonWatch', () => {
    let input = { _id: 'example' };
    let expected = true;
    expect(isJsonWatch(input)).toBe(expected);

    input = { _id: 'example', _ui: { watchType: 'json' } };
    expected = true;
    expect(isJsonWatch(input)).toBe(expected);

    input = { _id: 'example', _ui: { watchType: 'graph' } };
    expected = false;
    expect(isJsonWatch(input)).toBe(expected);

    input = { _id: 'example', _ui: { watchType: 'blocks' } };
    expected = false;
    expect(isJsonWatch(input)).toBe(expected);
  });
});
