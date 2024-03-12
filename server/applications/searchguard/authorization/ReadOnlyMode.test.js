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
  setupConfigMock,
  setupSearchGuardBackendMock,
  setupLoggerMock,
} from '../../../utils/mocks';
import { ReadOnlyMode } from './ReadOnlyMode';

describe.skip('ReadOnlyMode', () => {
  describe('register capabilities handler', () => {
    describe('anonymous pages', () => {
      test('ignores anonymous pages', async () => {
        const logger = setupLoggerMock();
        const readOnly = new ReadOnlyMode(logger);
        const pathsToIgnore = ['/searchguard/login', 'logout', 'customerror'];

        pathsToIgnore.forEach((path) => {
          const request = {
            headers: {
              referer: path,
            },
            url: {
              path: '/app/home',
            },
          };

          expect(readOnly.isAnonymousPage(request)).toEqual(true);
        });
      });
    });

    describe('read only by role', () => {
      test('detects read only role', async () => {
        const logger = setupLoggerMock();
        const authInfo = {
          sg_roles: ['SGS_KIBANA_USER', 'SGS_OWN_INDEX', 'readonly_role'],
          user_name: 'bruce',
          sg_tenants: {
            bruce: true,
            readwrite_1: true,
            readonly_1: false,
            readwrite_2: true,
            readonly_2: false,
            SGS_GLOBAL_TENANT: true,
          },
        };

        const configRoles = ['readonly_role'];

        const readOnly = new ReadOnlyMode(logger);

        expect(readOnly.hasReadOnlyRole(authInfo, configRoles)).toEqual(true);
      });

      test('ignores readonly role when no matching role found', async () => {
        const logger = setupLoggerMock();
        const authInfo = {
          sg_roles: ['SGS_KIBANA_USER', 'SGS_OWN_INDEX'],
        };
        const configRoles = ['readonly_role'];
        const readOnly = new ReadOnlyMode(logger);

        expect(readOnly.hasReadOnlyRole(authInfo, configRoles)).toEqual(false);
      });

      test('hides Multitenancy correctly for readonly role with only one tenant', () => {
        const logger = setupLoggerMock();
        const authInfo = {
          sg_roles: ['SGS_KIBANA_USER', 'SGS_OWN_INDEX', 'readonly_role'],
          user_name: 'bruce',
          sg_tenants: {
            bruce: true, // Disabled in config
            readwrite_1: true,
            SGS_GLOBAL_TENANT: true, // Global disabled in config
          },
        };

        const configServiceMock = {
          get: jest.fn((path) => {
            if (path === 'searchguard.multitenancy.enabled') return true;
            if (path === 'searchguard.multitenancy.tenants.enable_global') return false;
            if (path === 'searchguard.multitenancy.tenants.enable_private') return false;
            if (path === 'searchguard.readonly_mode.roles') return ['readonly_role'];
          }),
        };

        const readOnly = new ReadOnlyMode(logger);

        const originalCapabilities = {
          navLinks: {
            'searchguard-multitenancy': true,
          },
        };

        const toggledCapabilities = readOnly.toggleForReadOnlyRole(
          originalCapabilities,
          configServiceMock,
          authInfo
        );
        expect(toggledCapabilities).toEqual({
          navLinks: {
            'searchguard-multitenancy': false,
          },
          dashboard: {
            createNew: false,
            showWriteControls: false,
            saveQuery: false,
          },
        });
      });

      test('sets capabilities correctly for readonly role with more than one tenant', () => {
        const logger = setupLoggerMock();
        const authInfo = {
          sg_roles: ['SGS_KIBANA_USER', 'SGS_OWN_INDEX', 'readonly_role'],
          user_name: 'bruce',
          sg_tenants: {
            bruce: true, // Disabled in config
            readwrite_1: true,
            SGS_GLOBAL_TENANT: true, // Global ENABLED in config
          },
        };

        const configServiceMock = {
          get: jest.fn((path) => {
            if (path === 'searchguard.multitenancy.enabled') return true;
            if (path === 'searchguard.multitenancy.tenants.enable_global') return true;
            if (path === 'searchguard.multitenancy.tenants.enable_private') return false;
            if (path === 'searchguard.readonly_mode.roles') return ['readonly_role'];
          }),
        };

        const readOnly = new ReadOnlyMode(logger);

        const originalCapabilities = {
          navLinks: {
            dashboards: true,
            'searchguard-multitenancy': true,
            shouldBeDisabled: true,
          },
          catalogue: {
            dashboards: true,
            shouldBeDisabled: true,
          },
          someApp: {
            show: true,
          },
          dashboard: {
            createNew: true,
            showWriteControls: true,
            saveQuery: true,
            show: true,
          },
        };

        const toggledCapabilities = readOnly.toggleForReadOnlyRole(
          originalCapabilities,
          configServiceMock,
          authInfo
        );
        expect(toggledCapabilities).toEqual({
          // Should be true because we have the global + one named tenant
          navLinks: {
            dashboards: true,
            'searchguard-multitenancy': true,
            shouldBeDisabled: false,
          },
          catalogue: {
            dashboards: true,
            shouldBeDisabled: false,
          },
          someApp: {
            show: false,
          },
          dashboard: {
            createNew: false,
            showWriteControls: false,
            saveQuery: false,
            show: true,
          },
        });
      });
    });

    describe('read only by tenant', () => {
      test('detects read only tenant', async () => {
        const logger = setupLoggerMock();
        const authInfo = {
          sg_roles: ['SGS_KIBANA_USER', 'SGS_OWN_INDEX'],
          user_requested_tenant: 'readonly_1',
          user_name: 'bruce',
          sg_tenants: {
            bruce: true,
            readwrite_1: true,
            readonly_1: false,
            readwrite_2: true,
            readonly_2: false,
            SGS_GLOBAL_TENANT: true,
          },
        };

        const readOnly = new ReadOnlyMode(logger);
        expect(readOnly.isReadOnlyTenant(authInfo)).toEqual(true);
      });

      test('detects read write tenant', async () => {
        const logger = setupLoggerMock();
        const authInfo = {
          sg_roles: ['SGS_KIBANA_USER', 'SGS_OWN_INDEX'],
          user_requested_tenant: 'readwrite_1',
          user_name: 'bruce',
          sg_tenants: {
            bruce: true,
            readwrite_1: true,
            readonly_1: false,
            readwrite_2: true,
            readonly_2: false,
            SGS_GLOBAL_TENANT: true,
          },
        };

        const readOnly = new ReadOnlyMode(logger);
        expect(readOnly.isReadOnlyTenant(authInfo)).toEqual(false);
      });

      test('detects permissions correctly for private tenant', () => {
        const logger = setupLoggerMock();
        const authInfo = {
          sg_roles: ['SGS_KIBANA_USER', 'SGS_OWN_INDEX'],
          user_requested_tenant: '__user__',
          user_name: 'bruce',
          sg_tenants: {
            bruce: true,
            readwrite_1: true,
            readonly_1: false,
            readwrite_2: true,
            readonly_2: false,
            SGS_GLOBAL_TENANT: true,
          },
        };

        const readOnly = new ReadOnlyMode(logger);
        expect(readOnly.isReadOnlyTenant(authInfo)).toEqual(false);
      });

      test('detects permission correctly for global tenant', () => {
        const logger = setupLoggerMock();
        const authInfo = {
          sg_roles: ['SGS_KIBANA_USER', 'SGS_OWN_INDEX'],
          user_requested_tenant: '',
          user_name: 'bruce',
          sg_tenants: {
            bruce: true,
            readwrite_1: true,
            readonly_1: false,
            readwrite_2: true,
            readonly_2: false,
            SGS_GLOBAL_TENANT: false,
          },
        };

        const readOnly = new ReadOnlyMode(logger);
        expect(readOnly.isReadOnlyTenant(authInfo)).toEqual(true);
      });

      test('detects permission correctly for named tenant', () => {
        const logger = setupLoggerMock();
        const authInfo = {
          sg_roles: ['SGS_KIBANA_USER', 'SGS_OWN_INDEX'],
          user_requested_tenant: 'admin_tenant',
          user_name: 'bruce',
          sg_tenants: {
            bruce: true,
            admin_tenant: true,
            readwrite_1: true,
            readonly_1: false,
            readwrite_2: true,
            readonly_2: false,
            SGS_GLOBAL_TENANT: true,
          },
        };

        const readOnly = new ReadOnlyMode(logger);
        expect(readOnly.isReadOnlyTenant(authInfo)).toEqual(false);
      });
    });

    test('register read-only mode if read-only role', async () => {
      const logger = setupLoggerMock();
      const configService = setupConfigMock({
        get: jest.fn((path) => {
          if (path === 'searchguard.multitenancy.enabled') return true;
          if (path === 'searchguard.multitenancy.tenants.enable_global') return false;
          if (path === 'searchguard.multitenancy.tenants.enable_private') return true;
          if (path === 'searchguard.readonly_mode.roles') return ['readonly_role'];
        }),
      });

      const request = {
        headers: {
          authorization: 'Basic YWRtaW46YWRtaW4=',
        },
        url: {
          path: '/app',
        },
      };
      const authinfoResponse = {
        sg_roles: ['SGS_KIBANA_USER', 'SGS_OWN_INDEX', 'readonly_role'],
        user_name: 'bruce',
        sg_tenants: {
          bruce: true, // Disabled in config
          readwrite_1: true,
          SGS_GLOBAL_TENANT: true, // Global ENABLED in config
        },
      };
      const uiCapabilities = {
        navLinks: {
          dashboards: true,
          'searchguard-multitenancy': true,
          shouldBeDisabled: true,
        },
        catalogue: {
          dashboards: true,
          shouldBeDisabled: true,
        },
        someApp: {
          show: true,
        },
        dashboard: {
          createNew: true,
          showWriteControls: true,
          saveQuery: true,
          show: true,
        },
      };
      const expectedUiCapabilities = {
        navLinks: {
          dashboards: true,
          'searchguard-multitenancy': true,
          shouldBeDisabled: false,
        },
        catalogue: {
          dashboards: true,
          shouldBeDisabled: false,
        },
        someApp: {
          show: false,
        },
        dashboard: {
          createNew: false,
          showWriteControls: false,
          saveQuery: false,
          show: true,
        },
      };

      const authinfo = jest.fn().mockResolvedValue(authinfoResponse);

      const readOnly = new ReadOnlyMode(logger);
      readOnly.searchGuardBackend = setupSearchGuardBackendMock({ authinfo });
      readOnly.readOnlyModeRoles = ['readonly_role'];
      readOnly.multiTenancyEnabled = true;
      readOnly.configService = configService;

      // Internals of switcherHandler
      const toggledUiCapabilities = await readOnly.switcherHandler(cloneDeep(request), uiCapabilities);

      // switcherHandler
      expect(authinfo).toHaveBeenCalledWith(request.headers);
      // Should be true because we have the global + one named tenant
      expect(toggledUiCapabilities).toEqual(expectedUiCapabilities);
    });

    test('register read-only mode if read-only tenant', async () => {
      const logger = setupLoggerMock();
      const configService = setupConfigMock({
        get: jest.fn((path) => {
          if (path === 'searchguard.multitenancy.enabled') return true;
          if (path === 'searchguard.readonly_mode.roles') return ['readonly_role'];
        }),
      });

      const request = {
        headers: {
          authorization: 'Basic YWRtaW46YWRtaW4=',
        },
        url: {
          path: '/app',
        },
      };
      const authinfoResponse = {
        sg_roles: ['SGS_KIBANA_USER', 'SGS_OWN_INDEX'],
        user_requested_tenant: 'readonly_1',
        user_name: 'bruce',
        sg_tenants: {
          bruce: true,
          readwrite_1: true,
          readonly_1: false,
          readwrite_2: true,
          readonly_2: false,
          SGS_GLOBAL_TENANT: true,
        },
      };

      const userTenantInfoResponse = {
        data: {
          multi_tenancy_enabled: true,
          username: 'admin',
          default_tenant: 'readonly_1',
          tenants: {
            bruce: {
              exists: true,
              read_access: true,
              write_access: true,
            },
            readwrite_1: {
              exists: true,
              read_access: true,
              write_access: true,
            },
            readonly_1: {
              exists: true,
              read_access: true,
              write_access: false,
            },
            readwrite_2: {
              exists: true,
              read_access: true,
              write_access: true,
            },
            readonly_2: {
              exists: true,
              read_access: true,
              write_access: false,
            },
            SGS_GLOBAL_TENANT: {
              exists: true,
              read_access: true,
              write_access: true,
            },
          }
        }
      }

      const mockedTenantsRecord = {
        bruce: true,
        readwrite_1: true,
        readonly_1: false,
        readwrite_2: true,
        readonly_2: true,
        SGS_GLOBAL_TENANT: true
      };

      const uiCapabilities = {
        navLinks: {
          somethingElse: true,
          'kibana:stack_management': true,
          management: true,
        },
        catalogue: {
          somethingElse: true,
          advanced_settings: true,
          index_patterns: true,
        },
        someApp: {
          doSomething: true,
        },
        dashboard: {
          createNew: true,
          showWriteControls: true,
          saveQuery: true,
        },
        visualize: {
          createShortUrl: true,
          delete: true,
          save: true,
          saveQuery: true,
        },
        management: {
          kibana: {
            indexPatterns: true,
          },
        },
      };
      const expectedUiCapabilities = {
        navLinks: {
          somethingElse: true,
          'kibana:stack_management': false,
          management: false,
        },
        catalogue: {
          somethingElse: true,
          advanced_settings: false,
          index_patterns: false,
        },
        someApp: {
          doSomething: true,
        },
        dashboard: {
          createNew: false,
          showWriteControls: false,
          saveQuery: false,
        },
        visualize: {
          createShortUrl: false,
          delete: false,
          save: false,
          saveQuery: false,
        },
        management: {
          kibana: {
            indexPatterns: false,
          },
        },
      };



      const authinfo = jest.fn().mockResolvedValue(authinfoResponse);

      const readOnly = new ReadOnlyMode(logger);
      readOnly.readOnlyModeRoles = ['readonly_role'];
      readOnly.multiTenancyEnabled = true;
      readOnly.searchGuardBackend = setupSearchGuardBackendMock({
        authinfo,
        getUserTenantInfo: jest.fn().mockResolvedValue(userTenantInfoResponse),
        removeNonExistingReadOnlyTenants: jest.fn().mockReturnValue(userTenantInfoResponse),
        convertUserTenantsToRecord: jest.fn().mockReturnValue(mockedTenantsRecord)
      });
      readOnly.configService = configService;

      // Internals of switcherHandler
      const toggledUiCapabilities = await readOnly.switcherHandler(cloneDeep(request), uiCapabilities);

      // switcherHandler
      expect(authinfo).toHaveBeenCalledWith(request.headers);
      expect(toggledUiCapabilities).toEqual(expectedUiCapabilities);
    });
  });
});
