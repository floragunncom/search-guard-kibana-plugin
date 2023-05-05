/** @jest-environment jsdom */

import formikToRoleMapping from './formik_to_role_mapping';

describe('UI role mapping to role mapping', () => {
  test('can build role mapping', () => {
    const resource = {
      backend_roles: ['a', 'b'],
      hosts: ['c', 'd'],
      users: ['e', 'f'],
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

    expect(formikToRoleMapping(uiResource)).toEqual(resource);
  });
});
