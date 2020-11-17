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

import userToFormik from './user_to_formik';

describe('user to UI user', () => {
  test('can build UI user', () => {
    const resource = {
      hash: '',
      reserved: false,
      hidden: false,
      backend_roles: ['b', 'a'],
      attributes: {
        a: 'b',
        c: 'd',
      },
      description: 'Migrated from v6',
      static: false,
    };

    const uiResource = {
      reserved: false,
      hidden: false,
      backend_roles: ['b', 'a'],
      attributes: {
        a: 'b',
        c: 'd',
      },
      description: 'Migrated from v6',
      static: false,
      _username: 'admin',
      _password: '',
      _backendRoles: [{ label: 'a' }, { label: 'b' }],
      _attributes: [
        {
          key: 'a',
          value: 'b',
        },
        {
          key: 'c',
          value: 'd',
        },
      ],
      _changePassword: false,
    };

    expect(userToFormik(resource, uiResource._username)).toEqual(uiResource);
  });
});
