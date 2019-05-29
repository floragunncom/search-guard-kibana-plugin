import {
  formikToRole,
  uiIndexPermissionsToIndexPermissions,
  uiTenantPermissionsToTenantPermissions,
  uiClusterPermissionsToClusterPermissions
} from './formik_to_role';
import { FLS_MODES } from './constants';

describe('UI role to role ', () => {
  test('can build index permissions', () => {
    const resource = [
      {
        index_patterns: ['a', 'b'],
        fls: ['c', 'd'],
        masked_fields: ['e', 'f'],
        allowed_actions: {
          actiongroups: ['A', 'B'],
          permissions: [
            'cluster:a',
            'indices:a',
            'kibana:a'
          ]
        },
        flsmode: FLS_MODES.WHITELIST
      }
    ];

    const uiResource = [
      {
        _isAdvanced: false,
        _dls: '{}',
        flsmode: FLS_MODES.WHITELIST,
        index_patterns: [
          { label: 'a' },
          { label: 'b' }
        ],
        fls: [
          { label: 'c' },
          { label: 'd' }
        ],
        masked_fields: [
          { label: 'e' },
          { label: 'f' }
        ],
        allowed_actions: {
          actiongroups: [
            { label: 'A' },
            { label: 'B' }
          ],
          permissions: [
            { label: 'cluster:a' },
            { label: 'indices:a' },
            { label: 'kibana:a' }
          ]
        }
      }
    ];

    expect(uiIndexPermissionsToIndexPermissions(uiResource)).toEqual(resource);
  });

  test('can build tenant permissions', () => {
    const resource = [
      {
        tenant_patterns: ['a', 'b'],
        allowed_actions: ['c', 'd']
      }
    ];

    const uiResource =  [
      {
        tenant_patterns: [
          { label: 'a' },
          { label: 'b' }
        ],
        allowed_actions: [
          { label: 'c' },
          { label: 'd' }
        ]
      }
    ];

    expect(uiTenantPermissionsToTenantPermissions(uiResource)).toEqual(resource);
  });

  test('can build cluster permissions', () => {
    const resource = {
      actiongroups: [ 'A', 'B' ],
      permissions: [
        'cluster:a',
        'indices:a',
        'kibana:a'
      ]
    };

    const uiResource = {
      actiongroups: [
        { label: 'A' },
        { label: 'B' }
      ],
      permissions: [
        { label: 'cluster:a' },
        { label: 'indices:a' },
        { label: 'kibana:a' }
      ]
    };

    expect(uiClusterPermissionsToClusterPermissions(uiResource)).toEqual(resource);
  });

  test('can build role', () => {
    const resource = {
      description: 'Migrated from v6 (all types mapped)',
      cluster_permissions: {
        actiongroups: [ 'A', 'B' ],
        permissions: [
          'cluster:a',
          'indices:a',
          'kibana:a'
        ]
      },
      index_permissions: [
        {
          flsmode: FLS_MODES.WHITELIST,
          index_patterns: ['a', 'b'],
          fls: ['c', 'd'],
          masked_fields: ['e', 'f'],
          allowed_actions: {
            actiongroups: [ 'A', 'B' ],
            permissions: [
              'cluster:a',
              'indices:a',
              'kibana:a'
            ]
          }
        },
        {
          flsmode: FLS_MODES.BLACKLIST,
          index_patterns: ['g', 'h'],
          fls: ['i', 'j'],
          masked_fields: ['k', 'l'],
          allowed_actions: {
            actiongroups: [ 'A', 'B' ],
            permissions: [
              'cluster:a',
              'indices:a',
              'kibana:a'
            ]
          }
        }
      ],
      tenant_permissions: [
        {
          tenant_patterns: ['a', 'b'],
          allowed_actions: ['c', 'd']
        },
        {
          tenant_patterns: ['e', 'f'],
          allowed_actions: ['g', 'h']
        }
      ],
      global_application_permissions: []
    };

    const uiResource = {
      reserved: false,
      hidden: false,
      description: 'Migrated from v6 (all types mapped)',
      cluster_permissions: [
        'indices:a',
        'cluster:a',
        'kibana:a',
        'B',
        'A'
      ],
      index_permissions: [
        {
          index_patterns: ['b', 'a'],
          fls: ['d', 'c'],
          masked_fields: ['f', 'e'],
          allowed_actions: [
            'indices:a',
            'cluster:a',
            'kibana:a',
            'B',
            'A'
          ]
        },
        {
          index_patterns: ['g', 'h'],
          fls: ['~i', '~j'],
          masked_fields: ['l', 'k'],
          allowed_actions: [
            'indices:a',
            'cluster:a',
            'kibana:a',
            'B',
            'A'
          ]
        }
      ],
      tenant_permissions: [
        {
          tenant_patterns: ['b', 'a'],
          allowed_actions: ['d', 'c']
        },
        {
          tenant_patterns: ['f', 'e'],
          allowed_actions: ['h', 'g']
        }
      ],
      static: false,
      global_application_permissions: [],
      _name: 'A',
      _isClusterPermissionsAdvanced: false,
      _roleMapping: {
        users: [],
        backend_roles: [],
        hosts: []
      },
      _clusterPermissions: {
        actiongroups: [
          { label: 'A' },
          { label: 'B' }
        ],
        permissions: [
          { label: 'cluster:a' },
          { label: 'indices:a' },
          { label: 'kibana:a' }
        ]
      },
      _indexPermissions: [
        {
          index_patterns: [
            { label: 'a' },
            { label: 'b' }
          ],
          fls: [
            { label: 'c' },
            { label: 'd' }
          ],
          masked_fields: [
            { label: 'e' },
            { label: 'f' }
          ],
          allowed_actions: {
            actiongroups: [
              { label: 'A' },
              { label: 'B' }
            ],
            permissions: [
              { label: 'cluster:a' },
              { label: 'indices:a' },
              { label: 'kibana:a' }
            ]
          },
          flsmode: FLS_MODES.WHITELIST,
          _dls: '{}',
          _isAdvanced: false
        },
        {
          index_patterns: [
            { label: 'g' },
            { label: 'h' }
          ],
          fls: [
            { label: 'i' },
            { label: 'j' }
          ],
          masked_fields: [
            { label: 'k' },
            { label: 'l' }
          ],
          allowed_actions: {
            actiongroups: [
              { label: 'A' },
              { label: 'B' }
            ],
            permissions: [
              { label: 'cluster:a' },
              { label: 'indices:a' },
              { label: 'kibana:a' }
            ]
          },
          flsmode: FLS_MODES.BLACKLIST,
          _dls: '{}',
          _isAdvanced: false
        }
      ],
      _tenantPermissions: [
        {
          tenant_patterns: [
            { label: 'a' },
            { label: 'b' }
          ],
          allowed_actions: [
            { label: 'c' },
            { label: 'd' }
          ]
        },
        {
          tenant_patterns: [
            { label: 'e' },
            { label: 'f' }
          ],
          allowed_actions: [
            { label: 'g' },
            { label: 'h' }
          ]
        }
      ]
    };

    expect(formikToRole(uiResource)).toEqual(resource);
  });
});
