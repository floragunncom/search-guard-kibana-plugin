import { cloneDeep } from 'lodash';
import {
  tenantsToUiTenants,
  actionGroupsToUiClusterIndexTenantActionGroups,
  indicesToUiIndices,
  tenantPermissionToUiTenantPermission,
  flsmodeAndFlsToUiFlsmoddeAndFls,
  dlsToUiDls,
  indexPermissionToUiIndexPermission,
  clusterPermissionsToUiClusterPermissions,
  roleToFormik
} from './role_to_formik';
import { FLS_MODES } from './constants';

describe('role to UI role ', () => {
  test('can build UI tenants and indices', () => {
    const resource = {
      a: {},
      b: {}
    };

    const uiResource = [
      { label: 'a' },
      { label: 'b' }
    ];

    expect(tenantsToUiTenants(resource)).toEqual(uiResource);
    expect(indicesToUiIndices(resource)).toEqual(uiResource);
  });

  test('can build UI action groups', () => {
    const resource = {
      cluster: {},
      a_cluster: {},
      CLUSTER: {},
      GROUP: {},
      index: {},
      a_index: {},
      kibana: {},
      a_kibana: {},
      KIBANA: {}
    };

    const uiResource = {
      allClusterActionGroups: [
        { label: 'CLUSTER' },
        { label: 'a_cluster' },
        { label: 'cluster' }
      ],
      allIndexActionGroups: [
        { label: 'GROUP' },
        { label: 'a_index' },
        { label: 'index' }
      ],
      allTenantActionGroups: [
        { label: 'KIBANA' },
        { label: 'a_kibana' },
        { label: 'kibana' }
      ]
    };

    expect(actionGroupsToUiClusterIndexTenantActionGroups(resource)).toEqual(uiResource);
  });

  test('can build UI tenant permission', () => {
    const resource = {
      tenant_patterns: ['b', 'a'],
      allowed_actions: ['d', 'c']
    };

    const uiResource = {
      tenant_patterns: [
        { label: 'a' },
        { label: 'b' }
      ],
      allowed_actions: [
        { label: 'c' },
        { label: 'd' }
      ]
    };

    expect(tenantPermissionToUiTenantPermission(resource)).toEqual(uiResource);
  });

  test(`can build UI "${FLS_MODES.WHITELIST}" FLS`, () => {
    const resource = ['b', 'a'];

    const uiResource = {
      flsmode: FLS_MODES.WHITELIST,
      fls: [
        { label: 'a' },
        { label: 'b' }
      ]
    };

    expect(flsmodeAndFlsToUiFlsmoddeAndFls(resource)).toEqual(uiResource);
  });

  test(`can build UI "${FLS_MODES.BLACKLIST}" FLS`, () => {
    const resource = ['~b', '~a'];

    const uiResource = {
      flsmode: FLS_MODES.BLACKLIST,
      fls: [
        { label: 'a' },
        { label: 'b' }
      ]
    };

    expect(flsmodeAndFlsToUiFlsmoddeAndFls(resource)).toEqual(uiResource);
  });

  test('can build UI DLS', () => {
    const dls = JSON.stringify({ a: 'b', c: { d: 'e' } });
    const uiDls = '{\n  "a": "b",\n  "c": {\n    "d": "e"\n  }\n}';
    expect(dlsToUiDls(dls)).toBe(uiDls);
  });

  test('can build UI DLS if .dls value cannot be parsed', () => {
    const dls = '{ "a" }';
    const uiDls = '';
    expect(dlsToUiDls(dls)).toBe(uiDls);
  });

  test('can build UI index permission', () => {
    const resource = {
      index_patterns: ['b', 'a'],
      fls: ['d', 'c'],
      masked_fields: ['f', 'e'],
      allowed_actions: [
        'indices:a',
        'kibana:a',
        'cluster:a',
        'B',
        'A'
      ]
    };

    const uiResource = {
      _isAdvanced: true,
      _dls: '',
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
    };

    expect(indexPermissionToUiIndexPermission(resource)).toEqual(uiResource);
  });

  test('can build UI cluster permissions', () => {
    const resource = [
      'indices:a',
      'cluster:a',
      'kibana:a',
      'B',
      'A'
    ];

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

    expect(clusterPermissionsToUiClusterPermissions(resource)).toEqual(uiResource);
  });

  test('can build UI role', () => {
    const resource = {
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
    };

    const uiResource = {
      ...cloneDeep(resource),
      _name: 'A',
      _isClusterPermissionsAdvanced: true,
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
          _dls: '',
          _isAdvanced: true
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
          _dls: '',
          _isAdvanced: true
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

    expect(roleToFormik({ resource, id: 'A' })).toEqual(uiResource);
  });
});
