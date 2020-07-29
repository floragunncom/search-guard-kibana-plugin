/* eslint-disable @kbn/eslint/require-license-header */
import { UiConfigService as ConfigService, CONFIG_DEFAULTS } from './UiConfigService';
import { setupApiServiceMock, setupCoreMock, setupCoreContextMock } from '../utils/mocks';

describe('UiConfigService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('can construct the default config', () => {
    const configService = new ConfigService();

    expect(configService).toBeInstanceOf(ConfigService);
    expect(configService.getConfig()).toEqual(CONFIG_DEFAULTS);
  });

  describe('init', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    test('instantiate config if NOT authenticated', async () => {
      const core = setupCoreMock({
        uiSettingsGetImplementation: () => true,
      });
      const uiSettings = core.uiSettings;

      const coreContext = setupCoreContextMock({
        configGetImplementation: () => ({
          enabled: true,
          auth: {
            type: 'basicauth',
          },
          multitenancy: {},
          basicauth: {},
          configuration: {},
        }),
      });

      const error401 = new Error('Unauthorized');
      error401.code = 401;

      const apiService = setupApiServiceMock({
        loadRestInfoImplementation: () => Promise.reject(error401),
        loadSystemInfoImplementation: () =>
          Promise.resolve({
            cluster_name: 'searchguard_demo',
            sg_license: {
              type: 'TRIAL',
            },
            modules: {},
          }),
        loadAuthInfoImplementation: () => Promise.reject(error401),
        loadKibanaConfigImplementation: () => Promise.reject(error401),
      });

      const configService = new ConfigService({
        uiSettings,
        apiService,
        coreContext,
      });

      await configService.init();

      expect(configService).toBeInstanceOf(ConfigService);

      const expected = {
        searchguard: {
          enabled: true,
          auth: {
            type: 'basicauth',
          },
          basicauth: {},
          multitenancy: {},
          configuration: {},
        },
        restapiinfo: {},
        systeminfo: {
          cluster_name: 'searchguard_demo',
          sg_license: {
            type: 'TRIAL',
          },
          modules: {},
        },
        authinfo: {},
        is_dark_mode: true,
      };

      expect(configService.getConfig()).toEqual(expected);
      expect(JSON.parse(global.sessionStorage.searchguard)).toEqual({
        restapiinfo: expected.restapiinfo,
        authinfo: expected.authinfo,
        systeminfo: expected.systeminfo,
      });
    });

    test('instantiate config if authenticated', async () => {
      const core = setupCoreMock({
        uiSettingsGetImplementation: () => true,
      });
      const uiSettings = core.uiSettings;

      const coreContext = setupCoreContextMock({
        configGetImplementation: () => ({
          enabled: true,
          auth: {
            type: 'basicauth',
          },
          multitenancy: {},
          basicauth: {},
          configuration: {},
        }),
      });

      const apiService = setupApiServiceMock({
        loadRestInfoImplementation: () =>
          Promise.resolve({
            user: 'User [name=admin, backend_roles=[admin], requestedTenant=__user__]',
            user_name: 'admin',
            has_api_access: true,
            disabled_endpoints: {},
          }),
        loadSystemInfoImplementation: () =>
          Promise.resolve({
            cluster_name: 'searchguard_demo',
            sg_license: {
              type: 'TRIAL',
            },
            modules: {},
          }),
        loadAuthInfoImplementation: () =>
          Promise.resolve({
            secret: 'secret',
            user_requested_tenant: 'admin_tenant',
          }),
        loadKibanaConfigImplementation: () =>
          Promise.resolve({
            searchguard: {
              enabled: true,
              auth: {
                type: 'basicauth',
              },
            },
            elasticsearch: {
              username: 'kibanaserver',
            },
            kibana: {
              index: '.kibana',
            },
          }),
      });

      const configService = new ConfigService({
        uiSettings,
        apiService,
        coreContext,
      });

      await configService.init();

      const expected = {
        searchguard: {
          enabled: true,
          auth: {
            type: 'basicauth',
          },
          basicauth: {},
          multitenancy: {},
          configuration: {},
        },
        elasticsearch: {
          username: 'kibanaserver',
        },
        kibana: {
          index: '.kibana',
        },
        restapiinfo: {
          user: 'User [name=admin, backend_roles=[admin], requestedTenant=__user__]',
          user_name: 'admin',
          has_api_access: true,
          disabled_endpoints: {},
        },
        systeminfo: {
          cluster_name: 'searchguard_demo',
          sg_license: {
            type: 'TRIAL',
          },
          modules: {},
        },
        authinfo: {
          user_requested_tenant: 'admin_tenant',
        },
        is_dark_mode: true,
      };

      expect(configService).toBeInstanceOf(ConfigService);
      expect(configService.getConfig()).toEqual(expected);
      expect(JSON.parse(global.sessionStorage.searchguard)).toEqual({
        restapiinfo: expected.restapiinfo,
        authinfo: expected.authinfo,
        systeminfo: expected.systeminfo,
      });
    });
  });

  describe('helpers', () => {
    test('restApiEnbled', () => {
      let configService = new ConfigService({
        config: {
          systeminfo: {
            modules: {
              REST_MANAGEMENT_API: {},
            },
          },
        },
      });

      expect(configService.restApiEnabled()).toBe(true);

      configService = new ConfigService({
        config: {
          systeminfo: {
            modules: {},
          },
        },
      });

      expect(configService.restApiEnabled()).toBe(false);
    });

    test('hasApiAccess', () => {
      let configService = new ConfigService({
        config: {
          systeminfo: {
            modules: {
              REST_MANAGEMENT_API: {},
            },
          },
          restapiinfo: {
            has_api_access: true,
          },
        },
      });

      expect(configService.hasApiAccess()).toBe(true);

      configService = new ConfigService({
        config: {
          systeminfo: {
            modules: {},
          },
          restapiinfo: {},
        },
      });

      expect(configService.hasApiAccess()).toBe(false);

      configService = new ConfigService({
        config: {
          systeminfo: {
            modules: {
              REST_MANAGEMENT_API: {},
            },
          },
          restapiinfo: {},
        },
      });

      expect(configService.hasApiAccess()).toBe(false);

      configService = new ConfigService({
        config: {
          systeminfo: {
            modules: {},
          },
          restapiinfo: {
            has_api_access: true,
          },
        },
      });

      expect(configService.hasApiAccess()).toBe(false);
    });

    test('dlsFlsEnabled', () => {
      let configService = new ConfigService({
        config: {
          systeminfo: {
            modules: {
              DLSFLS: {},
            },
          },
        },
      });

      expect(configService.dlsFlsEnabled()).toBe(true);

      configService = new ConfigService({
        config: {
          systeminfo: {
            modules: {},
          },
        },
      });

      expect(configService.dlsFlsEnabled()).toBe(false);
    });

    test('multiTenancyEnabled', () => {
      let configService = new ConfigService({
        config: {
          systeminfo: {
            modules: {
              MULTITENANCY: {},
            },
          },
        },
      });

      expect(configService.multiTenancyEnabled()).toBe(true);

      configService = new ConfigService({
        config: {
          systeminfo: {
            MULTITENANCY: {},
          },
        },
      });

      expect(configService.multiTenancyEnabled()).toBe(false);
    });

    test('compliancyFeaturesEnabled', () => {
      let configService = new ConfigService({
        config: {
          systeminfo: {
            sg_license: {
              features: ['COMPLIANCE'],
            },
          },
        },
      });

      expect(configService.complianceFeaturesEnabled()).toBe(true);

      configService = new ConfigService({
        config: {
          systeminfo: {
            sg_license: {
              features: [],
            },
          },
        },
      });

      expect(configService.complianceFeaturesEnabled()).toBe(false);
    });

    test('endpointAndMethodEnabled', () => {
      let configService = new ConfigService({
        config: {
          restapiinfo: {},
        },
      });

      expect(configService.endpointAndMethodEnabled()).toBe(false);

      configService = new ConfigService({
        config: {
          restapiinfo: { disabled_endpoints: {} },
        },
      });

      expect(configService.endpointAndMethodEnabled()).toBe(true);

      configService = new ConfigService({
        config: {
          restapiinfo: { disabled_endpoints: { a: [] } },
        },
      });

      expect(configService.endpointAndMethodEnabled('a', 'b')).toBe(true);

      configService = new ConfigService({
        config: {
          restapiinfo: { disabled_endpoints: { a: ['b'] } },
        },
      });

      expect(configService.endpointAndMethodEnabled('a', 'b')).toBe(false);
    });

    test('licenseRequired', () => {
      let configService = new ConfigService({
        config: {
          systeminfo: {
            sg_license: {
              license_required: true,
            },
          },
        },
      });

      expect(configService.licenseRequired()).toBe(true);

      configService = new ConfigService({
        config: {
          systeminfo: {},
        },
      });

      expect(configService.licenseRequired()).toBe(false);
    });

    test('licenseValid', () => {
      let configService = new ConfigService({
        config: {
          systeminfo: {
            sg_license: {
              is_valid: true,
              license_required: true,
            },
          },
        },
      });

      expect(configService.licenseValid()).toBe(true);

      configService = new ConfigService({
        config: {
          systeminfo: {
            sg_license: {
              license_required: false,
            },
          },
        },
      });

      expect(configService.licenseValid()).toBe(true);

      configService = new ConfigService({
        config: {
          systeminfo: {
            sg_license: {
              is_valid: false,
              license_required: true,
            },
          },
        },
      });

      expect(configService.licenseValid()).toBe(false);
    });

    test('isTrialLicense', () => {
      let configService = new ConfigService({
        config: {
          systeminfo: {
            sg_license: {
              license_required: false,
            },
          },
        },
      });

      expect(configService.isTrialLicense()).toBe(false);

      configService = new ConfigService({
        config: {
          systeminfo: {
            sg_license: {
              license_required: true,
              type: 'TRIAL',
            },
          },
        },
      });

      expect(configService.isTrialLicense()).toBe(true);
    });

    test('licenseExpiresIn', () => {
      let configService = new ConfigService({
        config: {
          systeminfo: {
            sg_license: {
              expiry_in_days: 1,
            },
          },
        },
      });

      expect(configService.licenseExpiresIn()).toBe(1);

      configService = new ConfigService({
        config: {
          systeminfo: {},
        },
      });

      expect(configService.licenseExpiresIn()).toBe(0);
    });
  });
});
