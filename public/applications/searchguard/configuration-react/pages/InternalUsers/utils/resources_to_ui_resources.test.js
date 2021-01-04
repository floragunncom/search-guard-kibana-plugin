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

describe('internal users to UI table internal users', () => {
  test('can build UI table internal users', () => {
    const resources = {
      b: {
        hash: '',
        reserved: false,
        hidden: false,
        search_guard_roles: ['SGS_B', 'SGS_A'],
        backend_roles: ['a', 'b'],
        attributes: { a: 'b' },
        description: 'Migrated from v6',
        static: false,
      },
      a: {
        hash: '',
        reserved: true,
        hidden: false,
        search_guard_roles: ['SGS_C', 'SGS_D'],
        backend_roles: ['c', 'd'],
        attributes: { e: 'f' },
        description: 'Migrated from v6',
        static: false,
      },
    };

    const uiResources = [
      {
        _id: 'a',
        _searchGuardRoles: 'SGS_C, SGS_D',
        _backendRoles: 'c, d',
        reserved: true,
        hidden: false,
        search_guard_roles: ['SGS_C', 'SGS_D'],
        backend_roles: ['c', 'd'],
        attributes: { e: 'f' },
        description: 'Migrated from v6',
        static: false,
      },
      {
        _id: 'b',
        _searchGuardRoles: 'SGS_A, SGS_B',
        _backendRoles: 'a, b',
        reserved: false,
        hidden: false,
        search_guard_roles: ['SGS_B', 'SGS_A'],
        backend_roles: ['a', 'b'],
        attributes: { a: 'b' },
        description: 'Migrated from v6',
        static: false,
      },
    ];

    expect(resourcesToUiResources(resources)).toEqual(uiResources);
  });
});
