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
      description: 'Migrated from v6'
    };

    const resource = {
      backend_roles: ['g'],
      hosts: ['h', 'i'],
      users: ['j', 'k'],
      description: 'Migrated from v6'
    };

    expect(uiResourceToResource(uiResource)).toEqual(resource);
  });
});
