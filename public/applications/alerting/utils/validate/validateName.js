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

import {
  requiredText,
  problemWithValidationTryAgainText,
  nameAlreadyExistsText,
  forbiddenCharsText,
} from '../i18n/common';

export const validateName = (Service, isUpdatingName = false) => async (name) => {
  if (!name) return requiredText;
  const hasForbiddenChars = /[\.*\/]/gm.test(name);
  if (hasForbiddenChars) return forbiddenCharsText;

  try {
    const {
      resp: { _id },
    } = await Service.get(name);
    const newNameAlreadyExists = isUpdatingName && _id === name;
    if (newNameAlreadyExists) return nameAlreadyExistsText;
  } catch (error) {
    if (error.body && error.body.statusCode === 404) return null;
    return problemWithValidationTryAgainText;
  }

  return null;
};
