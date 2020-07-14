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
  test('can build UI tenants', () => {
    const resource = {
      a: {},
      b: {}
    };

    const uiResource = [
      { label: 'a' },
      { label: 'b' }
    ];

    expect(tenantsToUiTenants(resource)).toEqual(uiResource);
  });

  test('can build UI indices', () => {
    const resource = [
      { index: 'a', health: 'green' },
      { index: 'b', health: 'red' },
      { alias: 'c', index: 'b' },
    ];

    const uiResource = [
      { label: 'a', color: 'primary' },
      { label: 'b', color: 'danger' },
      { label: 'c', color: 'hollow' },
    ];

    expect(indicesToUiIndices(resource)).toEqual(uiResource);
  });

  test('can build UI action groups', () => {
    const resource = {
      a: { type: 'cluster' },
      b: { type: 'cluster' },
      c: { type: 'index' },
      d: { type: 'index' },
      e: { type: 'all' },
      f: { type: 'kibana' },
      g: { type: 'kibana' },
      SGS_SIGNALS_ACCOUNT_READ: { type: 'signals' },
      SGS_SIGNALS_ACCOUNT_MANAGE: { type: 'signals' },
      SGS_SIGNALS_WATCH_READ: { type: 'signals' },
      SGS_SIGNALS_WATCH_MANAGE: { type: 'signals' },
      SGS_SIGNALS_WATCH_EXECUTE: { type: 'signals' },
      SGS_SIGNALS_WATCH_ACTIVATE: { type: 'signals' },
      SGS_SIGNALS_WATCH_ACKNOWLEDGE: { type: 'signals' },
      // We omit the following action group
      // because it will be deprecated soon.
      SGS_SIGNALS_ALL: { type: 'signals' },
    };

    const uiResource = {
      allClusterActionGroups: [
        { label: 'SGS_SIGNALS_ACCOUNT_MANAGE' },
        { label: 'SGS_SIGNALS_ACCOUNT_READ' },
        { label: 'a' },
        { label: 'b' },
        { label: 'e' },
      ],
      allIndexActionGroups: [{ label: 'c' }, { label: 'd' }, { label: 'e' }],
      allTenantActionGroups: [
        { label: 'SGS_SIGNALS_WATCH_ACKNOWLEDGE' },
        { label: 'SGS_SIGNALS_WATCH_ACTIVATE' },
        { label: 'SGS_SIGNALS_WATCH_EXECUTE' },
        { label: 'SGS_SIGNALS_WATCH_MANAGE' },
        { label: 'SGS_SIGNALS_WATCH_READ' },
        { label: 'f' },
        { label: 'g' },
      ],
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
