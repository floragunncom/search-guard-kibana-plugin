import resourcesToUiResources from './resources_to_ui_resources';

describe('roles to UI table roles', () => {
  test('can build UI table roles', () => {
    const resources = {
      B_ROLE: {
        reserved: true,
        hidden: false,
        description: 'Migrated from v6 (all types mapped)',
        cluster_permissions: [
          'indices:a/b/c',
          'kibana:a/b/c',
          'cluster:a/b/c',
          'B',
          'A',
        ],
        index_permissions: [
          {
            index_patterns: ['b', 'a'],
            fls: [],
            masked_fields: [],
            allowed_actions: []
          },
          {
            index_patterns: ['d', 'c'],
            fls: [],
            masked_fields: [],
            allowed_actions: []
          }
        ],
        tenant_permissions: [
          {
            allowed_actions: [],
            tenant_patterns: ['e', 'f']
          },
          {
            allowed_actions: [],
            tenant_patterns: ['g']
          }
        ],
        static: true
      },
      A_ROLE: {
        reserved: true,
        hidden: false,
        description: 'Migrated from v6 (all types mapped)',
        cluster_permissions: [
          'indices:a/b/c',
          'kibana:a/b/c',
          'cluster:a/b/c',
          'B',
          'A',
        ],
        index_permissions: [
          {
            index_patterns: ['a'],
            fls: [],
            masked_fields: [],
            allowed_actions: []
          }
        ],
        tenant_permissions: [],
        static: true
      }
    };

    const uiResources = [
      {
        _id: 'A_ROLE',
        _indexPatterns: ['a'],
        _tenantPatterns: [],
        cluster_permissions: [
          'A',
          'B',
          'cluster:a/b/c',
          'indices:a/b/c',
          'kibana:a/b/c',
        ],
        reserved: true,
        hidden: false,
        description: 'Migrated from v6 (all types mapped)',
        index_permissions: [
          {
            index_patterns: ['a'],
            fls: [],
            masked_fields: [],
            allowed_actions: []
          }
        ],
        tenant_permissions: [],
        static: true
      },
      {
        _id: 'B_ROLE',
        _indexPatterns: ['a', 'b', 'c', 'd'],
        _tenantPatterns: ['e', 'f', 'g'],
        cluster_permissions: [
          'A',
          'B',
          'cluster:a/b/c',
          'indices:a/b/c',
          'kibana:a/b/c',
        ],
        reserved: true,
        hidden: false,
        description: 'Migrated from v6 (all types mapped)',
        index_permissions: [
          {
            index_patterns: ['b', 'a'],
            fls: [],
            masked_fields: [],
            allowed_actions: []
          },
          {
            index_patterns: ['d', 'c'],
            fls: [],
            masked_fields: [],
            allowed_actions: []
          }
        ],
        tenant_permissions: [
          {
            allowed_actions: [],
            tenant_patterns: ['e', 'f']
          },
          {
            allowed_actions: [],
            tenant_patterns: ['g']
          }
        ],
        static: true
      }
    ];

    expect(resourcesToUiResources(resources)).toEqual(uiResources);
  });
});
