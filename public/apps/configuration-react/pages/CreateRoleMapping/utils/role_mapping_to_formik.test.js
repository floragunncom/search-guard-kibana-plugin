import {
  rolesToUiRoles,
  internalUsersToUiInternalUsers,
  roleMappingToFormik
} from './role_mapping_to_formik';
import { DEFAULT_ROLE_MAPPING } from './constants';

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
      _name: [{ label: 'role_a' }],
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

    expect(roleMappingToFormik(resource, 'role_a')).toEqual(uiResource);
  });

  test('can build UI role mapping for the new resource', () => {
    const uiResource = {
      _backendRoles: [],
      _hosts: [],
      _name: [],
      _users: [],
      backend_roles: [],
      description: '',
      hosts: [],
      users: []
    };

    expect(roleMappingToFormik(DEFAULT_ROLE_MAPPING)).toEqual(uiResource);
  });
});
