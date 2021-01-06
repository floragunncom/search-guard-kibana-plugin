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

import { mustBeNumberBetween1And31Text } from '../../../../utils/i18n/common';

export const validateMonthDay = (value) => {
  if (!Number.isInteger(value) || value < 1 || value > 31) {
    return mustBeNumberBetween1And31Text;
  } else {
    return null;
  }
};
