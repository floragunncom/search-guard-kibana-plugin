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
  roleToFormik,
} from './role_to_formik';
import { FLS_MODES } from './constants';

describe('role to UI role ', () => {
  test('can build UI tenants', () => {
    const resource = {
      a: {},
      b: {},
    };

    const uiResource = [{ label: 'a' }, { label: 'b' }];

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
      allowed_actions: ['d', 'c'],
    };

    const uiResource = {
      tenant_patterns: [{ label: 'a' }, { label: 'b' }],
      allowed_actions: [{ label: 'c' }, { label: 'd' }],
    };

    expect(tenantPermissionToUiTenantPermission(resource)).toEqual(uiResource);
  });

  test(`can build UI "${FLS_MODES.WHITELIST}" FLS`, () => {
    const resource = ['b', 'a'];

    const uiResource = {
      flsmode: FLS_MODES.WHITELIST,
      fls: [{ label: 'a' }, { label: 'b' }],
    };

    expect(flsmodeAndFlsToUiFlsmoddeAndFls(resource)).toEqual(uiResource);
  });

  test(`can build UI "${FLS_MODES.BLACKLIST}" FLS`, () => {
    const resource = ['~b', '~a'];

    const uiResource = {
      flsmode: FLS_MODES.BLACKLIST,
      fls: [{ label: 'a' }, { label: 'b' }],
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
      masked_fields: [
        'ip_source::/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/::***',
        'aname::SHA-512',
        'bname',
      ],
      allowed_actions: ['indices:a', 'kibana:a', 'cluster:a', 'B', 'A'],
    };

    const uiResource = {
      _isAdvanced: true,
      _isAdvancedFLSMaskedFields: false,
      _dls: '',
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
    };

    expect(indexPermissionToUiIndexPermission(resource)).toEqual(uiResource);
  });

  test('can build UI index permission with default masked_fields', () => {
    const resource = {
      index_patterns: [],
      fls: [],
      masked_fields: [],
      allowed_actions: [],
    };

    const uiResource = {
      _isAdvanced: false,
      _isAdvancedFLSMaskedFields: false,
      _dls: '',
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
    };

    expect(indexPermissionToUiIndexPermission(resource)).toEqual(uiResource);
  });

  test('can build UI cluster permissions', () => {
    const resource = ['indices:a', 'cluster:a', 'kibana:a', 'B', 'A'];

    const uiResource = {
      actiongroups: [{ label: 'A' }, { label: 'B' }],
      permissions: [{ label: 'cluster:a' }, { label: 'indices:a' }, { label: 'kibana:a' }],
    };

    expect(clusterPermissionsToUiClusterPermissions(resource)).toEqual(uiResource);
  });

  test('can build UI role', () => {
    const resource = {
      reserved: false,
      hidden: false,
      description: 'Migrated from v6 (all types mapped)',
      exclude_cluster_permissions: ['indices:a', 'cluster:a', 'kibana:a', 'B', 'A'],
      cluster_permissions: ['indices:a', 'cluster:a', 'kibana:a', 'B', 'A'],
      exclude_index_permissions: [
        {
          index_patterns: ['b', 'a'],
          actions: ['indices:a', 'cluster:a', 'kibana:a', 'B', 'A'],
        },
        {
          index_patterns: ['g', 'h'],
          actions: ['indices:a', 'cluster:a', 'kibana:a', 'B', 'A'],
        },
      ],
      index_permissions: [
        {
          index_patterns: ['b', 'a'],
          fls: ['d', 'c'],
          masked_fields: [
            'ip_source::/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/::***',
            'ip_dst::/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/::***',
            'aname::SHA-512',
            'bname',
            'cname',
          ],
          allowed_actions: ['indices:a', 'cluster:a', 'kibana:a', 'B', 'A'],
        },
        {
          index_patterns: ['g', 'h'],
          fls: ['~i', '~j'],
          masked_fields: [
            'ip_source::/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/::***',
            'ip_dst::/[0-9]{1,3}$/::XXX::/^[0-9]{1,3}/::***',
            'aname::SHA-512',
            'bname',
            'cname',
          ],
          allowed_actions: ['indices:a', 'cluster:a', 'kibana:a', 'B', 'A'],
        },
      ],
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
    };

    const uiResource = {
      ...cloneDeep(resource),
      _name: 'A',
      _isClusterPermissionsAdvanced: true,
      _isClusterExclusionsAdvanced: true,
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
          _isAdvanced: true,
        },
        {
          index_patterns: [{ label: 'g' }, { label: 'h' }],
          actions: {
            actiongroups: [{ label: 'A' }, { label: 'B' }],
            permissions: [{ label: 'cluster:a' }, { label: 'indices:a' }, { label: 'kibana:a' }],
          },
          _isAdvanced: true,
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
          flsmode: FLS_MODES.WHITELIST,
          _dls: '',
          _isAdvanced: true,
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
          flsmode: FLS_MODES.BLACKLIST,
          _dls: '',
          _isAdvanced: true,
          _isAdvancedFLSMaskedFields: false,
        },
      ],
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

    expect(roleToFormik({ resource, id: 'A' })).toEqual(uiResource);
  });
});
