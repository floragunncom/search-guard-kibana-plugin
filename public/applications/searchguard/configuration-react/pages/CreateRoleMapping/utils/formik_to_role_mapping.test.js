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

import formikToRoleMapping from './formik_to_role_mapping';

describe('UI role mapping to role mapping', () => {
  test('can build role mapping', () => {
    const resource = {
      backend_roles: ['a', 'b'],
      hosts: ['c', 'd'],
      users: ['e', 'f'],
      description: '',
    };

    const uiResource = {
      hidden: false,
      reserved: false,
      static: false,
      backend_roles: ['b', 'a'],
      hosts: ['d', 'c'],
      users: ['f', 'e'],
      and_backend_roles: [],
      description: '',
      _name: [{ label: 'A_MAP' }],
      _backendRoles: [{ label: 'a' }, { label: 'b' }],
      _hosts: [{ label: 'c' }, { label: 'd' }],
      _users: [{ label: 'e' }, { label: 'f' }],
    };

    expect(formikToRoleMapping(uiResource)).toEqual(resource);
  });
});
