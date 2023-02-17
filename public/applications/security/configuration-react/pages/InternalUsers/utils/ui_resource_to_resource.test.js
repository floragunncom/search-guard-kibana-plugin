import uiResourceToResource from './ui_resource_to_resource';

describe('UI table internal user to internal user', () => {
  test('can build internal user', () => {
    const uiResource = {
      _id: 'a',
      _securityRoles: 'A, B',
      _backendRoles: 'a, b',
      reserved: true,
      hidden: false,
      backend_roles: ['a', 'b'],
      attributes: { a: 'b' },
      description: 'Migrated from v6',
      static: false,
      password: 'qwerty'
    };

    const resource = {
      backend_roles: ['a', 'b'],
      attributes: { a: 'b' },
      description: 'Migrated from v6',
      password: uiResource.password
    };

    expect(uiResourceToResource(uiResource)).toEqual(resource);
  });
});
