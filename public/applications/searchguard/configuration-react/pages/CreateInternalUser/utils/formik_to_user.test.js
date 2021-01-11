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

import formikToUser from './formik_to_user';

describe('UI user to user', () => {
  test('can build user', () => {
    const resource = {
      password: 'abcde',
      search_guard_roles: ['SGS_A', 'SGS_B'],
      backend_roles: ['a', 'b'],
      attributes: {
        a: 'b',
        c: 'd',
      },
      description: 'Migrated from v6',
    };

    const uiResource = {
      reserved: false,
      hidden: false,
      search_guard_roles: ['SGS_A', 'SGS_B'],
      backend_roles: ['b', 'a'],
      attributes: {
        a: 'b',
        c: 'd',
      },
      description: 'Migrated from v6',
      static: false,
      _isAdvanced: true,
      _username: 'admin',
      _password: 'abcde',
      _searchGuardRoles: [{ label: 'SGS_A' }, { label: 'SGS_B' }],
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
      _isComplexUserAttributes: false,
    };

    expect(formikToUser(uiResource)).toEqual(resource);
  });

  test('can build user with complex attributes', () => {
    const resource = {
      password: 'abcde',
      search_guard_roles: ['SGS_A', 'SGS_B'],
      backend_roles: ['a', 'b'],
      attributes: {
        a: 'b',
        c: {
          d: {
            e: 'f',
          },
        },
      },
      description: 'Migrated from v6',
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
      _isAdvanced: true,
      _username: 'admin',
      _password: 'abcde',
      _searchGuardRoles: [{ label: 'SGS_A' }, { label: 'SGS_B' }],
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
      _attributesString: JSON.stringify(
        {
          a: 'b',
          c: {
            d: {
              e: 'f',
            },
          },
        },
        null,
        2
      ),
      _isComplexUserAttributes: true,
    };

    expect(formikToUser(uiResource)).toEqual(resource);
  });
});
