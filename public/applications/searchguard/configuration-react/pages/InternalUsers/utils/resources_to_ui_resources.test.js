/** @jest-environment jsdom */

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
        static: false
      },
      a: {
        hash: '',
        reserved: true,
        hidden: false,
        search_guard_roles: ['SGS_C', 'SGS_D'],
        backend_roles: ['c', 'd'],
        attributes: { e: 'f' },
        description: 'Migrated from v6',
        static: false
      }
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
        static: false
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
        static: false
      }
    ];

    expect(resourcesToUiResources(resources)).toEqual(uiResources);
  });
});
