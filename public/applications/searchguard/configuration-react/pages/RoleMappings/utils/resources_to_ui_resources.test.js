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

describe('role mappings to UI table role mappings', () => {
  test('can build UI table role mappings', () => {
    const resources = {
      B: {
        reserved: false,
        hidden: false,
        backend_roles: ['b', 'a'],
        hosts: ['c', 'd'],
        users: ['e', 'f'],
        and_backend_roles: [],
        description: 'Migrated from v6',
      },
      A: {
        reserved: true,
        hidden: false,
        backend_roles: ['g'],
        hosts: ['h', 'i'],
        users: ['j', 'k'],
        and_backend_roles: [],
        description: 'Migrated from v6',
      },
    };

    const uiResources = [
      {
        _id: 'A',
        _isCorrespondingRole: false,
        reserved: true,
        hidden: false,
        backend_roles: ['g'],
        hosts: ['h', 'i'],
        users: ['j', 'k'],
        and_backend_roles: [],
        description: 'Migrated from v6',
      },
      {
        _id: 'B',
        _isCorrespondingRole: true,
        reserved: false,
        hidden: false,
        backend_roles: ['b', 'a'],
        hosts: ['c', 'd'],
        users: ['e', 'f'],
        and_backend_roles: [],
        description: 'Migrated from v6',
      },
    ];

    const correspondingRoles = { A: false, B: true };

    expect(resourcesToUiResources(resources, correspondingRoles)).toEqual(uiResources);
  });
});
