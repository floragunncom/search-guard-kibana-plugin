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

import { comboBoxOptionsToArray } from '../../../../../utils/helpers';
import { buildGraphQuery, buildUiGraphQuery } from '../../../utils';
import { CHECK_TYPES, CHECK_MYSEARCH } from '../../../utils/constants';

export function buildSearchRequest({ _ui: ui }, isUiGraphQuery = true) {
  const indices = comboBoxOptionsToArray(ui.index);

  return {
    type: CHECK_TYPES.SEARCH,
    name: CHECK_MYSEARCH,
    target: CHECK_MYSEARCH,
    request: {
      indices,
      body: isUiGraphQuery ? buildUiGraphQuery(ui) : buildGraphQuery(ui),
    },
  };
}
