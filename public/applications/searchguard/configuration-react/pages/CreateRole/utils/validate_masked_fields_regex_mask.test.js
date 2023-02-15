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

import { validateMaskedFieldsRegexMask } from './validate_masked_fields_regex_mask';
import { wrongDefinitionText } from '../../../../../utils/i18n/common';

describe('validateMaskedFieldsRegexMast', () => {
  test('valid regex', () => {
    expect(validateMaskedFieldsRegexMask('/.*/::*')).toBe(null);
    expect(validateMaskedFieldsRegexMask('/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/::***')).toBe(null);
  });

  test('wrong definition', () => {
    expect(validateMaskedFieldsRegexMask('SHA-1')).toBe(wrongDefinitionText);
    expect(validateMaskedFieldsRegexMask('/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/')).toBe(
      wrongDefinitionText
    );
  });
});
