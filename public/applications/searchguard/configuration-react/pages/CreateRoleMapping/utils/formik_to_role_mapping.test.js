import formikToRoleMapping from './formik_to_role_mapping';

describe('UI role mapping to role mapping', () => {
  test('can build role mapping', () => {
    const resource = {
      backend_roles: ['a', 'b'],
      hosts: ['c', 'd'],
      users: ['e', 'f'],
      ips: ['g', 'h'],
      description: ''
    };

    const uiResource = {
      hidden: false,
      reserved: false,
      static: false,
      backend_roles: ['b', 'a'],
      hosts: ['d', 'c'],
      users: ['f', 'e'],
      ips: ['g', 'h'],
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
      ],
      _ips: [
        { label: 'g'},
        { label: 'h'}
      ]
    };

    expect(formikToRoleMapping(uiResource)).toEqual(resource);
  });
});
