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

import { reduce, sortBy, forEach, cloneDeep } from 'lodash';

const resourcesToUiResources = (resources) =>
  sortBy(
    reduce(
      cloneDeep(resources),
      (result, values, id) => {
        result.push({
          ...values,
          cluster_permissions: sortBy(values.cluster_permissions),
          _id: id,
          _tenantPatterns: sortBy(
            reduce(
              values.tenant_permissions,
              (result, values) => {
                forEach(values.tenant_patterns, (pattern) => {
                  result.push(pattern);
                });
                return result;
              },
              []
            )
          ),
          _indexPatterns: sortBy(
            reduce(
              values.index_permissions,
              (result, values) => {
                forEach(values.index_patterns, (pattern) => {
                  result.push(pattern);
                });
                return result;
              },
              []
            )
          ),
        });
        return result;
      },
      []
    ),
    '_id'
  );

export default resourcesToUiResources;
