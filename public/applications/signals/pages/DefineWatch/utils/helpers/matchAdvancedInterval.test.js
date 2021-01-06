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

import { matchAdvancedInterval } from './matchAdvancedInterval';

describe('matchAdvancedInterval', () => {
  const correctNumbers = ['10ms', '1h30m', '1w1d1h1m1s1ms'];

  const wrongNumbers = ['10', '10.5', '10.5ms', '1m1h', '1wdhmsms'];

  test.each(correctNumbers)('should match %i', (num) => {
    expect(matchAdvancedInterval(num)).not.toEqual(null);
  });

  test.each(wrongNumbers)('should not match %i', (num) => {
    expect(matchAdvancedInterval(num)).toEqual(null);
  });
});
