/** @jest-environment jsdom */

import resourcesToUiResources from './resources_to_ui_resources';

describe('internal users to UI table internal users', () => {
  test('can build UI table internal users', () => {
    const resources = {
      b: {
        hash: '',
        reserved: false,
        hidden: false,
        internal_roles: ['B', 'A'],
        backend_roles: ['a', 'b'],
        attributes: { a: 'b' },
        description: 'Migrated from v6',
        static: false
      },
      a: {
        hash: '',
        reserved: true,
        hidden: false,
        internal_roles: ['C', 'D'],
        backend_roles: ['c', 'd'],
        attributes: { e: 'f' },
        description: 'Migrated from v6',
        static: false
      }
    };

    const uiResources = [
      {
        _id: 'a',
        _internalRoles: 'C, D',
        _backendRoles: 'c, d',
        reserved: true,
        hidden: false,
        internal_roles: ['C', 'D'],
        backend_roles: ['c', 'd'],
        attributes: { e: 'f' },
        description: 'Migrated from v6',
        static: false
      },
      {
        _id: 'b',
        _internalRoles: 'A, B',
        _backendRoles: 'a, b',
        reserved: false,
        hidden: false,
        internal_roles: ['B', 'A'],
        backend_roles: ['a', 'b'],
        attributes: { a: 'b' },
        description: 'Migrated from v6',
        static: false
      }
    ];

    expect(resourcesToUiResources(resources)).toEqual(uiResources);
  });
});
