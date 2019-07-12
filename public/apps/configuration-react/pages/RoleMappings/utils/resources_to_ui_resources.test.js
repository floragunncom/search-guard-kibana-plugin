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
        description: 'Migrated from v6'
      },
      A: {
        reserved: true,
        hidden: false,
        backend_roles: ['g'],
        hosts: ['h', 'i'],
        users: ['j', 'k'],
        and_backend_roles: [],
        description: 'Migrated from v6'
      }
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
        description: 'Migrated from v6'
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
        description: 'Migrated from v6'
      }
    ];

    const correspondingRoles = { A: false, B: true };

    expect(resourcesToUiResources(resources, correspondingRoles)).toEqual(uiResources);
  });
});
