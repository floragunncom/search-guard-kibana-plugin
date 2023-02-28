/** @jest-environment jsdom */

/*
 * Copyright 2023 Excelerate Technology Limited T/A Eliatra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * *    Copyright 2020 floragunn GmbH
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

import { validateMaskedFields } from './validate_masked_fields';
import { forbiddenCharactersText } from '../../../utils/i18n/common';

describe('validateMaskedFields', () => {
  test('prohibit fields with hash or regex', () => {
    let fields = [{ label: 'abc::SHA-512' }, { label: 'abc' }];

    expect(validateMaskedFields(fields)).toBe(forbiddenCharactersText);

    fields = [{ label: 'abc' }, { label: '*ip_source::/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/::***' }];

    expect(validateMaskedFields(fields)).toBe(forbiddenCharactersText);
  });

  test('valid fields', () => {
    const fields = [
      { label: '~abcSHA-512' },
      { label: '*ip_source/[0-9]{1,3}$/XXX/^[0-9]{1,3}/***' },
    ];

    expect(validateMaskedFields(fields)).toBe(null);
    expect(validateMaskedFields([])).toBe(null);
  });
});
