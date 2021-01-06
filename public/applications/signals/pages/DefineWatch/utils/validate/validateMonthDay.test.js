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

import { validateMonthDay } from './validateMonthDay';
import { mustBeNumberBetween1And31Text } from '../../../../utils/i18n/common';

describe('validateMonthDay', () => {
  it('can validate number between 1-31', () => {
    expect(validateMonthDay(1)).toBe(null);
    expect(validateMonthDay(31)).toBe(null);
  });

  it('fail to validate values', () => {
    expect(validateMonthDay('aString')).toBe(mustBeNumberBetween1And31Text);
    expect(validateMonthDay(0)).toBe(mustBeNumberBetween1And31Text);
    expect(validateMonthDay(32)).toBe(mustBeNumberBetween1And31Text);
    expect(validateMonthDay(-1)).toBe(mustBeNumberBetween1And31Text);
    expect(validateMonthDay(1.5)).toBe(mustBeNumberBetween1And31Text);
  });
});
