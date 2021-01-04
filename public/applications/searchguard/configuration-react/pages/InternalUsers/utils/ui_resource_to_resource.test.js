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

describe('UI table internal user to internal user', () => {
  test('can build internal user', () => {
    const uiResource = {
      _id: 'a',
      _searchGuardRoles: 'SGS_A, SGS_B',
      _backendRoles: 'a, b',
      reserved: true,
      hidden: false,
      backend_roles: ['a', 'b'],
      attributes: { a: 'b' },
      description: 'Migrated from v6',
      static: false,
      password: 'qwerty',
    };

    const resource = {
      backend_roles: ['a', 'b'],
      attributes: { a: 'b' },
      description: 'Migrated from v6',
      password: uiResource.password,
    };

    expect(uiResourceToResource(uiResource)).toEqual(resource);
  });
});
