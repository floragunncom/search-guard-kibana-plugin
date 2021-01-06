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

import { validateThrottleAdvancedInterval } from './validateThrottleAdvancedInterval';
import { requiredText } from '../../../../utils/i18n/common';
import { invalidThrottleTimeIntervalText } from '../../../../utils/i18n/watch';

describe('validateThrottleAdvancedInterval', () => {
  const correctNumbers = [
    '1s',
    '1h30m',
    '1m**2',
    '1m**2|1h',
    '1m**2.2|1h',
    '1142124m**2214124.2142142|114124h',
    '1w1d1h1m1s1ms**2|2w2d2h2m2s2ms',
  ];

  const wrongNumbers = [
    '12',
    '12.2',
    '1m2h',
    '1h1m**2|',
    '1h1m**2|1',
    '1m1h**2|1h',
    '1m**2|1m1h',
    '1wdhmsms**2|2wdhmsms',
  ];

  test.each(correctNumbers)('can validate %i', (num) => {
    expect(validateThrottleAdvancedInterval(num)).toEqual(null);
  });

  test.each(wrongNumbers)('fail to validate %i', (num) => {
    expect(validateThrottleAdvancedInterval(num)).toEqual(invalidThrottleTimeIntervalText);
  });

  test('fail to validate undefined', () => {
    expect(validateThrottleAdvancedInterval(undefined)).toEqual(requiredText);
  });
});
