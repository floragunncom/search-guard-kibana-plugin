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

import { omit } from 'lodash';
import { DEFAULT_PASSWORD, FIELDS_TO_OMIT_BEFORE_SAVE } from '../../../utils/constants';

const uiResourceToResource = (user) => ({
  password: DEFAULT_PASSWORD, // API prohibits saving user with empty password
  ...omit(user, ['_id', '_searchGuardRoles', '_backendRoles', ...FIELDS_TO_OMIT_BEFORE_SAVE]),
});

export default uiResourceToResource;
