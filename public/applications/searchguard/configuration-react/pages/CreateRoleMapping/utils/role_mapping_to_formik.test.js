/** @jest-environment jsdom */
import {
  rolesToUiRoles,
  internalUsersToUiInternalUsers,
  roleMappingToFormik
} from './role_mapping_to_formik';
import { DEFAULT_ROLE_MAPPING } from './constants';

describe('role mapping to UI role mapping', () => {
  test('can build UI roles difference', () => {
    const allRoles = {
      'c': {},
      'b': {},
      'a': {}
    };

    const allRoleMappings = {
      'a': {}
    };

    const uiResource = [
      {
        label: 'Available',
        options: [
          { label: 'b', color: 'default', disabled: false },
          { label: 'c', color: 'default', disabled: false }
        ]
      },
      {
        label: 'Occupied',
        options: [
          { label: 'a', color: 'subdued', disabled: true }
        ]
      }
    ];

    expect(rolesToUiRoles(allRoles, allRoleMappings)).toEqual(uiResource);
  });

  test('can build UI internal users', () => {
    const resource = {
      'c': {},
      'b': {},
      'a': {}
    };

    const uiResource = [
      { label: 'a' },
      { label: 'b' },
      { label: 'c' }
    ];

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
      ips: ['g', 'h'],
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
      ips: ['g', 'h'],
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
      ],
      _ips: [
        { label: 'g' },
        { label: 'h' }
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
      _ips: [],
      backend_roles: [],
      description: '',
      hosts: [],
      users: [],
      ips: [],
    };

    expect(roleMappingToFormik(DEFAULT_ROLE_MAPPING)).toEqual(uiResource);
  });
});
