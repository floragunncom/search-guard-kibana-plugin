import resourcesToUiResources from './resources_to_ui_resources';

describe('internal users to UI table internal users', () => {
  test('can build UI table internal users', () => {
    const resources = {
      b: {
        hash: '',
        reserved: false,
        hidden: false,
        backend_roles: ['a', 'b'],
        attributes: { a: 'b' },
        description: 'Migrated from v6',
        static: false
      },
      a: {
        hash: '',
        reserved: true,
        hidden: false,
        backend_roles: ['c', 'd'],
        attributes: { e: 'f' },
        description: 'Migrated from v6',
        static: false
      }
    };

    const uiResources = [
      {
        _id: 'a',
        reserved: true,
        hidden: false,
        backend_roles: ['c', 'd'],
        attributes: { e: 'f' },
        description: 'Migrated from v6',
        static: false
      },
      {
        _id: 'b',
        reserved: false,
        hidden: false,
        backend_roles: ['a', 'b'],
        attributes: { a: 'b' },
        description: 'Migrated from v6',
        static: false
      }
    ];

    expect(resourcesToUiResources(resources)).toEqual(uiResources);
  });
});
