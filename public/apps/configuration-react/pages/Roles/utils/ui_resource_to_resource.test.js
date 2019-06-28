import uiResourceToResource from './ui_resource_to_resource';

describe('UI table role to role', () => {
  test('can build role', () => {
    const uiResource = {
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
    };

    const resource = {
      cluster_permissions: [
        'A',
        'B',
        'cluster:a/b/c',
        'indices:a/b/c',
        'kibana:a/b/c',
      ],
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
    };

    expect(uiResourceToResource(uiResource)).toEqual(resource);
  });
});
