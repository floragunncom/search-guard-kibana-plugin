/** @jest-environment jsdom */
/*
 *    Copyright 2020 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  formikToRole,
  uiIndexPermissionsToIndexPermissions,
  uiTenantPermissionsToTenantPermissions,
  uiClusterPermissionsToClusterPermissions,
  uiFlsToFls,
} from './formik_to_role';
import { FLS_MODES } from './constants';

describe('UI role to role ', () => {
  test(`can build ${FLS_MODES.WHITELIST} fls`, () => {
    const fls = ['a', '~b'];
    const uiFls = [{ label: 'a' }, { label: '~b' }];

    expect(uiFlsToFls(uiFls, FLS_MODES.WHITELIST)).toEqual(fls);
  });

  test(`can build ${FLS_MODES.BLACKLIST} fls`, () => {
    const fls = ['~a', '~b'];
    const uiFls = [{ label: 'a' }, { label: '~~b' }];

    expect(uiFlsToFls(uiFls, FLS_MODES.BLACKLIST)).toEqual(fls);
  });

  test('can build index permissions', () => {
    const resource = [
      {
        index_patterns: ['a', 'b'],
        fls: ['c', 'd'],
        masked_fields: [
          'bname',
          'cname',
          'ip_source::/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/::***',
          'ip_dst::/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/::***',
          'aname::SHA-512',
        ],
        allowed_actions: ['A', 'B', 'cluster:a', 'indices:a', 'kibana:a'],
        dls: '{"query": {"term": {"manager": ${user.name|toJson} }}}',
      },
    ];

    const uiResource = [
      {
        _isAdvanced: false,
        _isAdvancedFLSMaskedFields: false,
        flsmode: FLS_MODES.WHITELIST,
        index_patterns: [{ label: 'a' }, { label: 'b' }],
        fls: [{ label: 'c' }, { label: 'd' }],
        masked_fields: [
          {
            value: '',
            fields: [
              {
                label: 'bname',
              },
              {
                label: 'cname',
              },
            ],
            mask_type: 'hash',
          },
          {
            value: '/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/::***',
            fields: [
              {
                label: 'ip_source',
              },
              {
                label: 'ip_dst',
              },
            ],
            mask_type: 'regex',
          },
          {
            value: 'SHA-512',
            fields: [
              {
                label: 'aname',
              },
            ],
            mask_type: 'hash',
          },
        ],
        masked_fields_advanced: [
          { label: 'aname::SHA-512' },
          { label: 'bname' },
          { label: 'cname' },
          { label: 'ip_dst::/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/::***' },
          { label: 'ip_source::/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/::***' },
        ],
        allowed_actions: {
          actiongroups: [{ label: 'A' }, { label: 'B' }],
          permissions: [{ label: 'cluster:a' }, { label: 'indices:a' }, { label: 'kibana:a' }],
        },
        dls: '',
        _dls: '{"query": {"term": {"manager": ${user.name|toJson} }}}',
      },
    ];

    expect(uiIndexPermissionsToIndexPermissions(uiResource)).toEqual(resource);
  });

  test('delete DLS', () => {
    const resource = [
      {
        index_patterns: [],
        fls: [],
        masked_fields: [],
        allowed_actions: [],
      },
    ];

    const uiResource = [
      {
        _isAdvanced: false,
        _isAdvancedFLSMaskedFields: false,
        flsmode: FLS_MODES.WHITELIST,
        index_patterns: [],
        fls: [],
        masked_fields: [],
        masked_fields_advanced: [],
        allowed_actions: {
          actiongroups: [],
          permissions: [],
        },
        _dls: '',
        dls: '{"query": {"term": {"manager": ${user.name|toJson} }}}',
      },
    ];

    expect(uiIndexPermissionsToIndexPermissions(uiResource)).toEqual(resource);
  });

  test('can build index permissions if advanced masked fields', () => {
    const resource = [
      {
        index_patterns: [],
        fls: [],
        masked_fields: ['e', 'f'],
        allowed_actions: [],
      },
    ];

    const uiResource = [
      {
        _isAdvanced: false,
        _isAdvancedFLSMaskedFields: true,
        flsmode: FLS_MODES.WHITELIST,
        index_patterns: [],
        fls: [],
        masked_fields: [],
        masked_fields_advanced: [{ label: 'e' }, { label: 'f' }],
        allowed_actions: {
          actiongroups: [],
          permissions: [],
        },
      },
    ];

    expect(uiIndexPermissionsToIndexPermissions(uiResource)).toEqual(resource);
  });

  test('can build index permissions if masked fields is empty', () => {
    const resource = [
      {
        index_patterns: [],
        fls: [],
        masked_fields: [],
        allowed_actions: [],
      },
    ];

    const uiResource = [
      {
        _isAdvanced: false,
        _isAdvancedFLSMaskedFields: true,
        flsmode: FLS_MODES.WHITELIST,
        index_patterns: [],
        fls: [],
        masked_fields: [
          {
            value: '',
            fields: [],
            mask_type: 'hash',
          },
        ],
        masked_fields_advanced: [],
        allowed_actions: {
          actiongroups: [],
          permissions: [],
        },
      },
    ];

    expect(uiIndexPermissionsToIndexPermissions(uiResource)).toEqual(resource);
  });

  test('can build tenant permissions', () => {
    const resource = [
      {
        tenant_patterns: ['a', 'b'],
        allowed_actions: ['c', 'd'],
      },
    ];

    const uiResource = [
      {
        tenant_patterns: [{ label: 'a' }, { label: 'b' }],
        allowed_actions: [{ label: 'c' }, { label: 'd' }],
      },
    ];

    expect(uiTenantPermissionsToTenantPermissions(uiResource)).toEqual(resource);
  });

  test('can build cluster permissions', () => {
    const resource = ['A', 'B', 'cluster:a', 'indices:a', 'kibana:a'];

    const uiResource = {
      actiongroups: [{ label: 'A' }, { label: 'B' }],
      permissions: [{ label: 'cluster:a' }, { label: 'indices:a' }, { label: 'kibana:a' }],
    };

    expect(uiClusterPermissionsToClusterPermissions(uiResource)).toEqual(resource);
  });

  test('can build role', () => {
    const resource = {
      description: 'Migrated from v6 (all types mapped)',
      exclude_index_permissions: [],
      cluster_permissions: ['A', 'B', 'cluster:a', 'indices:a', 'kibana:a'],
      exclude_cluster_permissions: ['A', 'B', 'cluster:a', 'indices:a', 'kibana:a'],
      exclude_index_permissions: [
        {
          index_patterns: ['a', 'b'],
          actions: ['A', 'B', 'cluster:a', 'indices:a', 'kibana:a'],
        },
        {
          index_patterns: ['g', 'h'],
          actions: ['A', 'B', 'cluster:a', 'indices:a', 'kibana:a'],
        },
      ],
      index_permissions: [
        {
          index_patterns: ['a', 'b'],
          fls: ['c', 'd'],
          masked_fields: [
            'bname',
            'ip_source::/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/::***',
            'aname::SHA-512',
          ],
          allowed_actions: ['A', 'B', 'cluster:a', 'indices:a', 'kibana:a'],
        },
        {
          index_patterns: ['g', 'h'],
          fls: ['~i', '~j'],
          masked_fields: [
            'bname',
            'ip_source::/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/::***',
            'aname::SHA-512',
          ],
          allowed_actions: ['A', 'B', 'cluster:a', 'indices:a', 'kibana:a'],
        },
      ],
      alias_permissions: [
        {
          alias_patterns: ['aalias', 'balias'],
          fls: ['calias', 'dalias'],
          masked_fields: [
            'bnamealias',
            'ip_source::/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/::***',
            'anamealias::SHA-512',
          ],
          allowed_actions: ['Aalias', 'Balias', 'cluster:aalias', 'indices:aalias', 'kibana:aalias'],
        },
        {
          alias_patterns: ['galias', 'halias'],
          fls: ['~ialias', '~jalias'],
          masked_fields: [
            'bnamealias',
            'ip_source::/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/::***',
            'anamealias::SHA-512',
          ],
          allowed_actions: ['Aalias', 'Balias', 'cluster:aalias', 'indices:aalias', 'kibana:aalias'],
        },
      ],
      data_stream_permissions: [],
      tenant_permissions: [
        {
          tenant_patterns: ['a', 'b'],
          allowed_actions: ['c', 'd'],
        },
        {
          tenant_patterns: ['e', 'f'],
          allowed_actions: ['g', 'h'],
        },
      ],
    };

    const uiResource = {
      reserved: false,
      hidden: false,
      description: 'Migrated from v6 (all types mapped)',
      cluster_permissions: ['indices:a', 'cluster:a', 'kibana:a', 'B', 'A'],
      exclude_index_permissions: [],
      index_permissions: [
        {
          index_patterns: ['b', 'a'],
          fls: ['d', 'c'],
          masked_fields: [
            'ip_source::/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/::***',
            'aname::SHA-512',
            'bname',
          ],
          allowed_actions: ['indices:a', 'cluster:a', 'kibana:a', 'B', 'A'],
        },
        {
          index_patterns: ['g', 'h'],
          fls: ['~i', '~j'],
          masked_fields: [
            'ip_source::/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/::***',
            'aname::SHA-512',
            'bname',
          ],
          allowed_actions: ['indices:a', 'cluster:a', 'kibana:a', 'B', 'A'],
        },
      ],
      alias_permissions: [
        {
          alias_patterns: ['balias', 'aalias'],
          fls: ['dalias', 'calias'],
          masked_fields: [
            'ip_source::/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/::***',
            'anamealias::SHA-512',
            'bnamealias',
          ],
          allowed_actions: ['indices:aalias', 'cluster:aalias', 'kibana:aalias', 'Balias', 'Aalias'],
        },
        {
          alias_patterns: ['galias', 'halias'],
          fls: ['~ialias', '~jalias'],
          masked_fields: [
            'ip_source::/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/::***',
            'anamealias::SHA-512',
            'bnamealias',
          ],
          allowed_actions: ['indices:aalias', 'cluster:aalias', 'kibana:aalias', 'Balias', 'Aalias'],
        },
      ],
      data_stream_permissions: [],
      tenant_permissions: [
        {
          tenant_patterns: ['b', 'a'],
          allowed_actions: ['d', 'c'],
        },
        {
          tenant_patterns: ['f', 'e'],
          allowed_actions: ['h', 'g'],
        },
      ],
      static: false,
      _name: 'A',
      _isClusterPermissionsAdvanced: false,
      _isClusterExclusionsAdvanced: false,
      _roleMapping: {
        users: [],
        backend_roles: [],
        hosts: [],
      },
      _excludeClusterPermissions: {
        actiongroups: [{ label: 'A' }, { label: 'B' }],
        permissions: [{ label: 'cluster:a' }, { label: 'indices:a' }, { label: 'kibana:a' }],
      },
      _clusterPermissions: {
        actiongroups: [{ label: 'A' }, { label: 'B' }],
        permissions: [{ label: 'cluster:a' }, { label: 'indices:a' }, { label: 'kibana:a' }],
      },
      _excludeIndexPermissions: [
        {
          index_patterns: [{ label: 'a' }, { label: 'b' }],
          actions: {
            actiongroups: [{ label: 'A' }, { label: 'B' }],
            permissions: [{ label: 'cluster:a' }, { label: 'indices:a' }, { label: 'kibana:a' }],
          },
          _isAdvanced: false,
        },
        {
          index_patterns: [{ label: 'g' }, { label: 'h' }],
          actions: {
            actiongroups: [{ label: 'A' }, { label: 'B' }],
            permissions: [{ label: 'cluster:a' }, { label: 'indices:a' }, { label: 'kibana:a' }],
          },
          _isAdvanced: false,
        },
      ],
      _indexPermissions: [
        {
          index_patterns: [{ label: 'a' }, { label: 'b' }],
          fls: [{ label: 'c' }, { label: 'd' }],
          masked_fields: [
            {
              value: '',
              fields: [
                {
                  label: 'bname',
                },
              ],
              mask_type: 'hash',
            },
            {
              value: '/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/::***',
              fields: [
                {
                  label: 'ip_source',
                },
              ],
              mask_type: 'regex',
            },
            {
              value: 'SHA-512',
              fields: [
                {
                  label: 'aname',
                },
              ],
              mask_type: 'hash',
            },
          ],
          masked_fields_advanced: [
            { label: 'aname::SHA-512' },
            { label: 'bname' },
            { label: 'ip_source::/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/::***' },
          ],
          allowed_actions: {
            actiongroups: [{ label: 'A' }, { label: 'B' }],
            permissions: [{ label: 'cluster:a' }, { label: 'indices:a' }, { label: 'kibana:a' }],
          },
          flsmode: FLS_MODES.WHITELIST,
          _isAdvanced: false,
          _isAdvancedFLSMaskedFields: false,
        },
        {
          index_patterns: [{ label: 'g' }, { label: 'h' }],
          fls: [{ label: 'i' }, { label: 'j' }],
          masked_fields: [
            {
              value: '',
              fields: [
                {
                  label: 'bname',
                },
              ],
              mask_type: 'hash',
            },
            {
              value: '/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/::***',
              fields: [
                {
                  label: 'ip_source',
                },
              ],
              mask_type: 'regex',
            },
            {
              value: 'SHA-512',
              fields: [
                {
                  label: 'aname',
                },
              ],
              mask_type: 'hash',
            },
          ],
          masked_fields_advanced: [
            { label: 'aname::SHA-512' },
            { label: 'bname' },
            { label: 'ip_source::/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/::***' },
          ],
          allowed_actions: {
            actiongroups: [{ label: 'A' }, { label: 'B' }],
            permissions: [{ label: 'cluster:a' }, { label: 'indices:a' }, { label: 'kibana:a' }],
          },
          flsmode: FLS_MODES.BLACKLIST,
          _isAdvanced: false,
          _isAdvancedFLSMaskedFields: false,
        },
      ],
      _aliasPermissions: [
        {
          alias_patterns: [{ label: 'aalias' }, { label: 'balias' }],
          fls: [{ label: 'calias' }, { label: 'dalias' }],
          masked_fields: [
            {
              value: '',
              fields: [
                {
                  label: 'bnamealias',
                },
              ],
              mask_type: 'hash',
            },
            {
              value: '/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/::***',
              fields: [
                {
                  label: 'ip_source',
                },
              ],
              mask_type: 'regex',
            },
            {
              value: 'SHA-512',
              fields: [
                {
                  label: 'anamealias',
                },
              ],
              mask_type: 'hash',
            },
          ],
          masked_fields_advanced: [
            { label: 'anamealias::SHA-512' },
            { label: 'bnamealias' },
            { label: 'ip_source::/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/::***' },
          ],
          allowed_actions: {
            actiongroups: [{ label: 'Aalias' }, { label: 'Balias' }],
            permissions: [{ label: 'cluster:aalias' }, { label: 'indices:aalias' }, { label: 'kibana:aalias' }],
          },
          flsmode: FLS_MODES.WHITELIST,
          _isAdvanced: false,
          _isAdvancedFLSMaskedFields: false,
        },
        {
          alias_patterns: [{ label: 'galias' }, { label: 'halias' }],
          fls: [{ label: 'ialias' }, { label: 'jalias' }],
          masked_fields: [
            {
              value: '',
              fields: [
                {
                  label: 'bnamealias',
                },
              ],
              mask_type: 'hash',
            },
            {
              value: '/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/::***',
              fields: [
                {
                  label: 'ip_source',
                },
              ],
              mask_type: 'regex',
            },
            {
              value: 'SHA-512',
              fields: [
                {
                  label: 'anamealias',
                },
              ],
              mask_type: 'hash',
            },
          ],
          masked_fields_advanced: [
            { label: 'anamealias::SHA-512' },
            { label: 'bnamealias' },
            { label: 'ip_source::/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/::***' },
          ],
          allowed_actions: {
            actiongroups: [{ label: 'Aalias' }, { label: 'Balias' }],
            permissions: [{ label: 'cluster:aalias' }, { label: 'indices:aalias' }, { label: 'kibana:aalias' }],
          },
          flsmode: FLS_MODES.BLACKLIST,
          _isAdvanced: false,
          _isAdvancedFLSMaskedFields: false,
        },
      ],
      _dataStreamPermissions: [],
      _tenantPermissions: [
        {
          tenant_patterns: [{ label: 'a' }, { label: 'b' }],
          allowed_actions: [{ label: 'c' }, { label: 'd' }],
        },
        {
          tenant_patterns: [{ label: 'e' }, { label: 'f' }],
          allowed_actions: [{ label: 'g' }, { label: 'h' }],
        },
      ],
    };

    expect(formikToRole(uiResource)).toEqual(resource);
  });
});
