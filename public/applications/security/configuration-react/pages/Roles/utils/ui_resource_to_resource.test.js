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

import uiResourceToResource from './ui_resource_to_resource';

describe('UI table role to role', () => {
  test('can build role', () => {
    const uiResource = {
      _id: 'A_ROLE',
      _indexPatterns: ['a'],
      _excludeIndexPatterns: ['a'],
      _tenantPatterns: [],
      cluster_permissions: ['A', 'B', 'cluster:a/b/c', 'indices:a/b/c', 'kibana:a/b/c'],
      exclude_cluster_permissions: ['A', 'B', 'cluster:a/b/c', 'indices:a/b/c', 'kibana:a/b/c'],
      reserved: true,
      hidden: false,
      description: 'Migrated from v6 (all types mapped)',
      index_permissions: [
        {
          index_patterns: ['a'],
          fls: [],
          masked_fields: [],
          allowed_actions: [],
        },
      ],
      exclude_index_permissions: [
        {
          index_patterns: ['a'],
          actions: [],
        },
      ],
      tenant_permissions: [],
      static: true,
    };

    const resource = {
      cluster_permissions: ['A', 'B', 'cluster:a/b/c', 'indices:a/b/c', 'kibana:a/b/c'],
      exclude_cluster_permissions: ['A', 'B', 'cluster:a/b/c', 'indices:a/b/c', 'kibana:a/b/c'],
      description: 'Migrated from v6 (all types mapped)',
      index_permissions: [
        {
          index_patterns: ['a'],
          fls: [],
          masked_fields: [],
          allowed_actions: [],
        },
      ],
      exclude_index_permissions: [
        {
          index_patterns: ['a'],
          actions: [],
        },
      ],
      tenant_permissions: [],
    };

    expect(uiResourceToResource(uiResource)).toEqual(resource);
  });
});
