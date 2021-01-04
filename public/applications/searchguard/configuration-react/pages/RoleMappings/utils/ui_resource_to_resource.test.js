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

import uiResourceToResource from './ui_resource_to_resource';

describe('UI table role mapping to role mapping', () => {
  test('can build role mapping', () => {
    const uiResource = {
      _id: 'A_ROLE_MAPPING',
      _isCorrespondingRole: true,
      reserved: true,
      hidden: false,
      backend_roles: ['g'],
      hosts: ['h', 'i'],
      users: ['j', 'k'],
      and_backend_roles: [],
      description: 'Migrated from v6',
    };

    const resource = {
      backend_roles: ['g'],
      hosts: ['h', 'i'],
      users: ['j', 'k'],
      description: 'Migrated from v6',
    };

    expect(uiResourceToResource(uiResource)).toEqual(resource);
  });
});
