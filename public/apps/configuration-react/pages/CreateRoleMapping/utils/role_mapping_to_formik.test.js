import {
  rolesToUiRoles,
  internalUsersToUiInternalUsers,
  roleMappingToFormik
} from './role_mapping_to_formik';

describe('role mapping to UI role mapping', () => {
  test('can build UI roles and internal users', () => {
    const resource = {
      'b': {},
      'a': {}
    };

    const uiResource = [
      { label: 'a' },
      { label: 'b' }
    ];

    expect(rolesToUiRoles(resource)).toEqual(uiResource);
    expect(internalUsersToUiInternalUsers(resource)).toEqual(uiResource);
  });

  test('can build UI role mapping', () => {
    const resource = {
      hidden: false,
      reserved: false,
      static: false,
      backend_roles: ['b', 'a'],
      hosts: ['d', 'c'],
      users: ['f', 'e'],
      and_backend_roles: [],
      description: ''
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
      _backendRoles: [
        { label: 'a' },
        { label: 'b' }
      ],
      _hosts: [
        { label: 'c' },
        { label: 'd' }
      ],
      _users: [
        { label: 'e' },
        { label: 'f' }
      ]
    };

    expect(roleMappingToFormik(resource, { label: uiResource._name[0].label })).toEqual(uiResource);
  });
});
