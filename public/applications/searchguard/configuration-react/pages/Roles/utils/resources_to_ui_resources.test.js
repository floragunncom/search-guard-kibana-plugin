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

import resourcesToUiResources from './resources_to_ui_resources';

describe('roles to UI table roles', () => {
  test('can build UI table roles', () => {
    const resources = {
      B_ROLE: {
        reserved: true,
        hidden: false,
        description: 'Migrated from v6 (all types mapped)',
        cluster_permissions: ['indices:a/b/c', 'kibana:a/b/c', 'cluster:a/b/c', 'B', 'A'],
        exclude_cluster_permissions: ['indices:a/b/c', 'kibana:a/b/c', 'cluster:a/b/c', 'B', 'A'],
        index_permissions: [
          {
            index_patterns: ['b', 'a'],
            fls: [],
            masked_fields: [],
            allowed_actions: [],
          },
          {
            index_patterns: ['d', 'c'],
            fls: [],
            masked_fields: [],
            allowed_actions: [],
          },
        ],
        /*
        exclude_index_permissions: [
          {
            index_patterns: ['b', 'a'],
            actions: [],
          },
          {
            index_patterns: ['d', 'c'],
            actions: [],
          },
        ],
         */
        alias_permissions: [
          {
            alias_patterns: ['b', 'a'],
            allowed_actions: ['EXAMPLE_ACTION_GROUP']
          },
          {
            alias_patterns: ['d', 'c'],
            allowed_actions: []
          }
        ],
        data_stream_permissions: [
          {
            data_stream_patterns: ['b', 'a'],
            allowed_actions: [
              "indices:admin/data_stream/create"
            ]
          }
        ],
        tenant_permissions: [
          {
            allowed_actions: [],
            tenant_patterns: ['e', 'f'],
          },
          {
            allowed_actions: [],
            tenant_patterns: ['g'],
          },
        ],
        static: true,
      },
      A_ROLE: {
        reserved: true,
        hidden: false,
        description: 'Migrated from v6 (all types mapped)',
        cluster_permissions: ['indices:a/b/c', 'kibana:a/b/c', 'cluster:a/b/c', 'B', 'A'],
        exclude_cluster_permissions: ['indices:a/b/c', 'kibana:a/b/c', 'cluster:a/b/c', 'B', 'A'],
        index_permissions: [
          {
            index_patterns: ['a'],
            fls: [],
            masked_fields: [],
            allowed_actions: [],
          },
        ],
        /*
        exclude_index_permissions: [
          {
            index_patterns: ['a'],
            actions: [],
          },
        ],

         */
        alias_permissions: [
          {
            alias_patterns: ['a'],
            allowed_actions: ['EXAMPLE_ACTION_GROUP']
          }
        ],
        data_stream_permissions: [],
        tenant_permissions: [],
        static: true,
      },
    };

    const uiResources = [
      {
        _id: 'A_ROLE',
        _indexPatterns: ['a'],
        //_excludeIndexPatterns: ['a'],
        _aliasPatterns: ['a'],
        _dataStreamPatterns: [],
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
        /*
        exclude_index_permissions: [
          {
            index_patterns: ['a'],
            actions: [],
          },
        ],
         */
        alias_permissions: [
          {
            alias_patterns: ['a'],
            allowed_actions: ['EXAMPLE_ACTION_GROUP']
          },
        ],
        data_stream_permissions: [],
        tenant_permissions: [],
        static: true,
      },
      {
        _id: 'B_ROLE',
        _indexPatterns: ['a', 'b', 'c', 'd'],
        //_excludeIndexPatterns: ['a', 'b', 'c', 'd'],
        _aliasPatterns: ['a', 'b', 'c', 'd'],
        _dataStreamPatterns: ['a', 'b'],
        _tenantPatterns: ['e', 'f', 'g'],
        cluster_permissions: ['A', 'B', 'cluster:a/b/c', 'indices:a/b/c', 'kibana:a/b/c'],
        exclude_cluster_permissions: ['A', 'B', 'cluster:a/b/c', 'indices:a/b/c', 'kibana:a/b/c'],
        reserved: true,
        hidden: false,
        description: 'Migrated from v6 (all types mapped)',
        index_permissions: [
          {
            index_patterns: ['b', 'a'],
            fls: [],
            masked_fields: [],
            allowed_actions: [],
          },
          {
            index_patterns: ['d', 'c'],
            fls: [],
            masked_fields: [],
            allowed_actions: [],
          },
        ],
        /*
        exclude_index_permissions: [
          {
            index_patterns: ['b', 'a'],
            actions: [],
          },
          {
            index_patterns: ['d', 'c'],
            actions: [],
          },
        ],

         */
        alias_permissions: [
          {
            alias_patterns: ['b', 'a'],
            allowed_actions: ['EXAMPLE_ACTION_GROUP']
          },
          {
            alias_patterns: ['d', 'c'],
            allowed_actions: []
          }
        ],
        data_stream_permissions: [
          {
            data_stream_patterns: ['b', 'a'],
            allowed_actions: [
              "indices:admin/data_stream/create"
            ]
          }
        ],
        tenant_permissions: [
          {
            allowed_actions: [],
            tenant_patterns: ['e', 'f'],
          },
          {
            allowed_actions: [],
            tenant_patterns: ['g'],
          },
        ],
        static: true,
      },
    ];

    expect(resourcesToUiResources(resources)).toEqual(uiResources);
  });
});
