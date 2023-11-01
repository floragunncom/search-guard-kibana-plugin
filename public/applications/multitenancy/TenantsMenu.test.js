/** @jest-environment jsdom */
/*
 *    Copyright 2021 floragunn GmbH
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

import React from 'react';
import {
  getPersistentColorFromText,
  tenantsToUiTenants,
  TenantAvatar,
  hasUserDashboardOnlyRole,
} from './TenantsMenu';
import { readText, readWriteText, emptyReadonlyTenantText } from './utils/i18n';
import { GLOBAL_TENANT_NAME } from "../../../common/multitenancy";

test('getPersistentColorFromText', () => {
  expect(getPersistentColorFromText('qwerty')).toBe('#17A2F5');
  expect(getPersistentColorFromText('qwert y')).toBe('#17A2FD');
  expect(getPersistentColorFromText('qwe')).toBe('#17A000');
  expect(getPersistentColorFromText('')).toBe('#000000');
  expect(getPersistentColorFromText(GLOBAL_TENANT_NAME)).toBe('#000000');
  expect(getPersistentColorFromText()).toBe('#000000');
});

describe('tenantsToUiTenants', () => {
  test('build tenants for admin', () => {
    const currentTenant = 'Global';
    const tenantinfo = {
      tenants: {
        [GLOBAL_TENANT_NAME]: {
          write_access: true,
        },
        admin_tenant: {
          write_access: true,
        },
        trex: {
          write_access: true,
        },
        admin: {
          write_access: true,
        }
      }
    };
    const authinfo = {
      user_name: 'admin',
    };
    const globalTenantEnabled = true;
    const privateTenantEnabled = true;
    const isDashboardOnlyRole = false;

    const uiTenants = [
      {
        label: 'Tenants',
        isGroupLabel: true,
      },
      {
        'aria-label': 'Global',
        searchableLabel: 'Global',
        label: 'Global',
        checked: 'on',
        disabled: false,
        prepend: <TenantAvatar name="Global" />,
        append: readWriteText,
        'data-test-subj': 'sg.tenantsMenu.tenant.global',
      },
      {
        'aria-label': 'Private',
        searchableLabel: 'Private',
        label: 'Private',
        checked: undefined,
        disabled: false,
        prepend: <TenantAvatar name="Private" />,
        append: readWriteText,
        'data-test-subj': 'sg.tenantsMenu.tenant.private',
      },
      {
        'aria-label': 'admin_tenant',
        searchableLabel: 'admin_tenant',
        label: 'admin_tenant',
        checked: undefined,
        disabled: false,
        prepend: <TenantAvatar name="admin_tenant" />,
        append: readWriteText,
        'data-test-subj': 'sg.tenantsMenu.tenant.admin_tenant',
      },
      {
        'aria-label': 'trex',
        searchableLabel: 'trex',
        label: 'trex',
        checked: undefined,
        disabled: false,
        prepend: <TenantAvatar name="trex" />,
        append: readWriteText,
        'data-test-subj': 'sg.tenantsMenu.tenant.trex',
      },
    ];

    expect(
      tenantsToUiTenants({
        tenantinfo,
        globalTenantEnabled,
        privateTenantEnabled,
        authinfo,
        currentTenant,
        isDashboardOnlyRole,
      })
    ).toEqual(uiTenants);
  });

  test('build tenants if global tenant disabled', () => {
    const currentTenant = 'Global';

    const tenantinfo = {
      tenants: {
        [GLOBAL_TENANT_NAME]: {
          write_access: true,
        },
        admin_tenant: {
          write_access: true,
        },
        trex: {
          write_access: true,
        },
        admin: {
          write_access: true,
        }
      }
    };
    const authinfo = {
      user_name: 'admin',
    };
    const globalTenantEnabled = false;
    const privateTenantEnabled = true;
    const isDashboardOnlyRole = false;

    const uiTenants = [
      {
        label: 'Tenants',
        isGroupLabel: true,
      },
      {
        'aria-label': 'Private',
        searchableLabel: 'Private',
        label: 'Private',
        checked: undefined,
        disabled: false,
        prepend: <TenantAvatar name="Private" />,
        append: readWriteText,
        'data-test-subj': 'sg.tenantsMenu.tenant.private',
      },
      {
        'aria-label': 'admin_tenant',
        searchableLabel: 'admin_tenant',
        label: 'admin_tenant',
        checked: undefined,
        disabled: false,
        prepend: <TenantAvatar name="admin_tenant" />,
        append: readWriteText,
        'data-test-subj': 'sg.tenantsMenu.tenant.admin_tenant',
      },
      {
        'aria-label': 'trex',
        searchableLabel: 'trex',
        label: 'trex',
        checked: undefined,
        disabled: false,
        prepend: <TenantAvatar name="trex" />,
        append: readWriteText,
        'data-test-subj': 'sg.tenantsMenu.tenant.trex',
      },
    ];

    expect(
      tenantsToUiTenants({
        tenantinfo,
        globalTenantEnabled,
        privateTenantEnabled,
        authinfo,
        currentTenant,
        isDashboardOnlyRole,
      })
    ).toEqual(uiTenants);
  });

  test('build tenants if private tenant disabled', () => {
    const currentTenant = 'Global';

    const tenantinfo = {
      tenants: {
        [GLOBAL_TENANT_NAME]: {
          write_access: true,
        },
        admin_tenant: {
          write_access: true,
        },
        trex: {
          write_access: true,
        },
        admin: {
          write_access: true,
        }
      }
    };

    const authinfo = {
      user_name: 'admin',
    };
    const globalTenantEnabled = true;
    const privateTenantEnabled = false;
    const isDashboardOnlyRole = false;

    const uiTenants = [
      {
        label: 'Tenants',
        isGroupLabel: true,
      },
      {
        'aria-label': 'Global',
        searchableLabel: 'Global',
        label: 'Global',
        checked: 'on',
        disabled: false,
        prepend: <TenantAvatar name="Global" />,
        append: readWriteText,
        'data-test-subj': 'sg.tenantsMenu.tenant.global',
      },
      {
        'aria-label': 'admin_tenant',
        searchableLabel: 'admin_tenant',
        label: 'admin_tenant',
        checked: undefined,
        disabled: false,
        prepend: <TenantAvatar name="admin_tenant" />,
        append: readWriteText,
        'data-test-subj': 'sg.tenantsMenu.tenant.admin_tenant',
      },
      {
        'aria-label': 'trex',
        searchableLabel: 'trex',
        label: 'trex',
        checked: undefined,
        disabled: false,
        prepend: <TenantAvatar name="trex" />,
        append: readWriteText,
        'data-test-subj': 'sg.tenantsMenu.tenant.trex',
      },
    ];

    expect(
      tenantsToUiTenants({
        tenantinfo,
        globalTenantEnabled,
        privateTenantEnabled,
        authinfo,
        currentTenant,
        isDashboardOnlyRole,
      })
    ).toEqual(uiTenants);
  });

  test('build tenants if dashboard-only role', () => {
    const currentTenant = 'Global';
    const tenantinfo = {
      tenants: {
        [GLOBAL_TENANT_NAME]: {
          write_access: true,
        },
        admin_tenant: {
          write_access: true,
        },
        trex: {
          write_access: true,
        },
        admin: {
          write_access: true,
        }
      }
    };
    const authinfo = {
      user_name: 'admin',
    };

    const globalTenantEnabled = true;
    const privateTenantEnabled = true;
    const isDashboardOnlyRole = true;

    const uiTenants = [
      {
        label: 'Tenants',
        isGroupLabel: true,
      },
      {
        'aria-label': 'Global',
        searchableLabel: 'Global',
        label: 'Global',
        checked: 'on',
        disabled: false,
        prepend: <TenantAvatar name="Global" />,
        append: readText,
        'data-test-subj': 'sg.tenantsMenu.tenant.global',
      },
      {
        'aria-label': 'admin_tenant',
        searchableLabel: 'admin_tenant',
        label: 'admin_tenant',
        checked: undefined,
        disabled: false,
        prepend: <TenantAvatar name="admin_tenant" />,
        append: readText,
        'data-test-subj': 'sg.tenantsMenu.tenant.admin_tenant',
      },
      {
        'aria-label': 'trex',
        searchableLabel: 'trex',
        label: 'trex',
        checked: undefined,
        disabled: false,
        prepend: <TenantAvatar name="trex" />,
        append: readText,
        'data-test-subj': 'sg.tenantsMenu.tenant.trex',
      },
    ];

    expect(
      tenantsToUiTenants({
        tenantinfo,
        globalTenantEnabled,
        privateTenantEnabled,
        authinfo,
        currentTenant,
        isDashboardOnlyRole,
      })
    ).toEqual(uiTenants);
  });

  test('build tenants if trex tenant has not been created yet and is readonly', () => {
    const currentTenant = 'Global';

    const tenantinfo = {
      tenants: {
        [GLOBAL_TENANT_NAME]: {
          write_access: true,
        },
        admin_tenant: {
          write_access: true,
        },
        trex: {
          write_access: false,
          exists: false
        },
        admin: {
          write_access: true,
        }
      }
    };

    const authinfo = {
      user_name: 'admin',
    };
    const globalTenantEnabled = true;
    const privateTenantEnabled = true;
    const isDashboardOnlyRole = false;

    const uiTenants = [
      {
        label: 'Tenants',
        isGroupLabel: true,
      },
      {
        'aria-label': 'Global',
        searchableLabel: 'Global',
        label: 'Global',
        checked: 'on',
        disabled: false,
        prepend: <TenantAvatar name="Global" />,
        append: readWriteText,
        'data-test-subj': 'sg.tenantsMenu.tenant.global',
      },
      {
        'aria-label': 'Private',
        searchableLabel: 'Private',
        label: 'Private',
        checked: undefined,
        disabled: false,
        prepend: <TenantAvatar name="Private" />,
        append: readWriteText,
        'data-test-subj': 'sg.tenantsMenu.tenant.private',
      },
      {
        'aria-label': 'admin_tenant',
        searchableLabel: 'admin_tenant',
        label: 'admin_tenant',
        checked: undefined,
        disabled: false,
        prepend: <TenantAvatar name="admin_tenant" />,
        append: readWriteText,
        'data-test-subj': 'sg.tenantsMenu.tenant.admin_tenant',
      },
      {
        'aria-label': 'trex',
        searchableLabel: 'trex',
        label: 'trex',
        checked: undefined,
        disabled: true,
        prepend: <TenantAvatar name="trex" />,
        append: emptyReadonlyTenantText,
        'data-test-subj': 'sg.tenantsMenu.tenant.trex',
      },
    ];

    expect(
      tenantsToUiTenants({
        tenantinfo,
        globalTenantEnabled,
        privateTenantEnabled,
        authinfo,
        currentTenant,
        isDashboardOnlyRole,
      })
    ).toEqual(uiTenants);
  });
});

describe('hasUserDashboardOnlyRole', () => {
  test('user does not have the dashboard-only role', () => {
    const readOnlyConfig = {
      roles: [],
    };
    const authinfo = {
      sg_roles: ['SGS_ALL_ACCESS', 'SGS_OWN_INDEX'],
    };

    expect(hasUserDashboardOnlyRole({ readOnlyConfig, authinfo })).toBe(false);
  });

  test('user has the dashboard-only role', () => {
    const readOnlyConfig = {
      roles: ['ROLE_A'],
    };
    const authinfo = {
      sg_roles: ['SGS_ALL_ACCESS', 'SGS_OWN_INDEX', 'ROLE_A'],
    };

    expect(hasUserDashboardOnlyRole({ readOnlyConfig, authinfo })).toBe(true);
  });
});
