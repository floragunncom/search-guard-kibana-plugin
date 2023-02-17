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

import { forbiddenCharactersText } from '../../../../../utils/i18n/common';

// In the default mode we don't allow setting field name with
// hash function name or regex. Use the form inputs instead.
export function validateMaskedFields(fields = []) {
  if (fields.some(({ label = '' } = {}) => label.includes('::'))) {
    return forbiddenCharactersText;
  }
  return null;
}
