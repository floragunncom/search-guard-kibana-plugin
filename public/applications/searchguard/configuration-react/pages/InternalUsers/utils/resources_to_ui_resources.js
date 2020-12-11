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

import { reduce, omit, sortBy } from 'lodash';

const resourcesToUiResources = (allUsers) =>
  sortBy(
    reduce(
      allUsers,
      (result, user, id) => {
        result.push({
          ...omit(user, ['hash']),
          _id: id,
          _searchGuardRoles: Array.isArray(user.search_guard_roles)
            ? [...user.search_guard_roles].sort().join(', ')
            : [],
          _backendRoles: Array.isArray(user.backend_roles)
            ? [...user.backend_roles].sort().join(', ')
            : [],
        });
        return result;
      },
      []
    ),
    ['_id']
  );

export default resourcesToUiResources;
