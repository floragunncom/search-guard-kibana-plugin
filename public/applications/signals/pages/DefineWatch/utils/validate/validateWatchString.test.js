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

import { validateWatchString } from './validateWatchString';
import { requiredText, invalidJsonText } from '../../../../utils/i18n/common';

describe('validateWatchString', () => {
  it('can validate JSON', () => {
    expect(validateWatchString('{ "a": 1 }')).toBe(null);
  });

  it('can validate """', () => {
    expect(validateWatchString('{ "script": """ifelse""" }')).toBe(null);
  });

  it('fail to validate if no value', () => {
    expect(validateWatchString('')).toBe(requiredText);
    expect(validateWatchString()).toBe(requiredText);
  });

  it('fail to validate if JSON error', () => {
    expect(validateWatchString('"a": 1 }')).toBe(invalidJsonText);
  });
});
