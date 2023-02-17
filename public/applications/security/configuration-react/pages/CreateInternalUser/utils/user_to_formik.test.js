/** @jest-environment jsdom */
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
      internal_roles: ['B', 'A'],
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
      internal_roles: ['B', 'A'],
      backend_roles: ['b', 'a'],
      attributes: {
        a: 'b',
        c: 'd',
      },
      description: 'Migrated from v6',
      static: false,
      _isAdvanced: true,
      _username: 'admin',
      _password: '',
      _internalRoles: [{ label: 'A' }, { label: 'B' }],
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
          c: 'd',
        },
        null,
        2
      ),
      _isComplexUserAttributes: false,
      _changePassword: false,
    };

    expect(userToFormik(resource, { id: uiResource._username })).toEqual(uiResource);
  });

  test('can build UI user if complex attributes', () => {
    const resource = {
      hash: '',
      reserved: false,
      hidden: false,
      internal_roles: ['B', 'A'],
      backend_roles: ['b', 'a'],
      attributes: {
        a: 'b',
        c: { d: 'e' },
      },
      description: 'Migrated from v6',
      static: false,
    };

    const uiResource = {
      reserved: false,
      hidden: false,
      internal_roles: ['B', 'A'],
      backend_roles: ['b', 'a'],
      attributes: {
        a: 'b',
        c: { d: 'e' },
      },
      description: 'Migrated from v6',
      static: false,
      _isAdvanced: true,
      _username: 'admin',
      _password: '',
      _internalRoles: [{ label: 'A' }, { label: 'B' }],
      _backendRoles: [{ label: 'a' }, { label: 'b' }],
      _attributes: [],
      _attributesString: JSON.stringify(
        {
          a: 'b',
          c: { d: 'e' },
        },
        null,
        2
      ),
      _isComplexUserAttributes: true,
      _changePassword: false,
    };

    expect(userToFormik(resource, { id: uiResource._username })).toEqual(uiResource);
  });

  test('can build UI without _isAdvanced flag', () => {
    const resource = {
      hash: '',
      reserved: false,
      hidden: false,
      internal_roles: ['B', 'A'],
      backend_roles: [],
      attributes: {
        a: 'b',
        c: { d: 'e' },
      },
      description: 'Migrated from v6',
      static: false,
    };

    const uiResource = {
      reserved: false,
      hidden: false,
      internal_roles: ['B', 'A'],
      backend_roles: [],
      attributes: {
        a: 'b',
        c: { d: 'e' },
      },
      description: 'Migrated from v6',
      static: false,
      _isAdvanced: false,
      _username: 'admin',
      _password: '',
      _internalRoles: [{ label: 'A' }, { label: 'B' }],
      _backendRoles: [],
      _attributes: [],
      _attributesString: JSON.stringify(
        {
          a: 'b',
          c: { d: 'e' },
        },
        null,
        2
      ),
      _isComplexUserAttributes: true,
      _changePassword: false,
    };

    expect(userToFormik(resource, { id: uiResource._username })).toEqual(uiResource);
  });
});
