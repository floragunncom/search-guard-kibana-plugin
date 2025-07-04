/* eslint-disable @kbn/eslint/require-license-header */
import { UiConfigService as ConfigService } from './UiConfigService';
import { ApiService } from './ApiService';
import { setupCoreMock, setupCoreContextMock } from '../utils/mocks';

describe('UiConfigService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('can construct the default config', () => {
    // Seems a bit weird that all uiSettingsGetMocks return "enabled" or "disabled"
    // Extend if they are used for something else than dark mode.
    const uiSettingsGet = jest.fn(() => 'disabled');
    const uiSettings = setupCoreMock({ uiSettingsGet }).uiSettings;

    const configGet = jest.fn(() => ({
      enabled: true,
      auth: {
        type: 'basicauth',
      },
    }));
    const coreContext = setupCoreContextMock({ configGet });

    const configService = new ConfigService({ coreContext, uiSettings });

    expect(uiSettingsGet).toHaveBeenCalledTimes(1);
    expect(configGet).toHaveBeenCalledTimes(1);
    expect(configService).toBeInstanceOf(ConfigService);
    expect(configService.getConfig()).toEqual({
      authinfo: {},
      elasticsearch: {},
      is_dark_mode: false,
      kibana: {},
      restapiinfo: {},
      searchguard: {},
      searchguard: {
        auth: {
          type: 'basicauth',
        },
        enabled: true,
      },
      server: {},
      systeminfo: {},
    });
  });

  describe('fetchConfig', () => {
    let uiSettingsGet;
    let uiSettings;
    let configGet;
    let coreContext;

    beforeEach(() => {
      uiSettingsGet = jest.fn(() => 'enabled');
      uiSettings = setupCoreMock({ uiSettingsGet }).uiSettings;

      configGet = jest.fn(() => ({
        enabled: true,
        auth: {
          type: 'basicauth',
        },
      }));
      coreContext = setupCoreContextMock({ configGet });
    });

    test('fetch limited config', async () => {
      const httpClient = {
        get: (path) => {
          if (path.includes('systeminfo')) {
            return Promise.resolve({
              data: {
                cluster_name: 'searchguard_demo',
                sg_license: {
                  type: 'TRIAL',
                },
                modules: {},
              },
            });
          }
        },
      };
      const apiService = new ApiService(httpClient);

      const configService = new ConfigService({ coreContext, uiSettings, apiService });
      configService.isLoginPage = () => true;
      await configService.fetchConfig();

      expect(configService.config).toEqual({
        authinfo: {},
        elasticsearch: {},
        is_dark_mode: true,
        kibana: {},
        restapiinfo: {},
        searchguard: {
          auth: {
            type: 'basicauth',
          },
          enabled: true,
        },
        server: {},
        systeminfo: {
          cluster_name: 'searchguard_demo',
          modules: {},
          sg_license: {
            type: 'TRIAL',
          },
        },
      });
    });

    test('fetch unlimited config', async () => {
      const httpClient = {
        get: (path) => {
          const resp = { data: {} };

          if (path.includes('kibana_config')) {
            resp.data = {
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
            };
          } else if (path.includes('authinfo')) {
            resp.data = {
              secret: 'secret',
              user_name: 'admin',
              user_requested_tenant: 'admin_tenant',
            };
          } else if (path.includes('systeminfo')) {
            resp.data = {
              cluster_name: 'searchguard_demo',
              sg_license: {
                type: 'TRIAL',
              },
              modules: {},
            };
          } else if (path.includes('restapiinfo')) {
            resp.data = {
              user: 'User [name=admin, backend_roles=[admin], requestedTenant=__user__]',
              user_name: 'admin',
              has_api_access: true,
              disabled_endpoints: {},
            };
          }

          return Promise.resolve(resp);
        },
      };
      const apiService = new ApiService(httpClient);

      const configService = new ConfigService({ coreContext, uiSettings, apiService });
      configService.isLoginPage = () => false;
      await configService.fetchConfig();

      expect(configService.config).toEqual({
        authinfo: {
          user_name: 'admin',
          user_requested_tenant: 'admin_tenant',
        },
        elasticsearch: {
          username: 'kibanaserver',
        },
        is_dark_mode: true,
        kibana: {
          index: '.kibana',
        },
        restapiinfo: {
          disabled_endpoints: {},
          has_api_access: true,
          user: 'User [name=admin, backend_roles=[admin], requestedTenant=__user__]',
          user_name: 'admin',
        },
        searchguard: {
          auth: {
            type: 'basicauth',
          },
          enabled: true,
        },
        server: {},
        systeminfo: {
          cluster_name: 'searchguard_demo',
          modules: {},
          sg_license: {
            type: 'TRIAL',
          },
        },
      });
    });
  });

  describe('helpers', () => {
    let uiSettingsGet;
    let uiSettings;
    let configGet;
    let coreContext;

    beforeEach(() => {
      uiSettingsGet = jest.fn(() => 'enabled');
      uiSettings = setupCoreMock({ uiSettingsGet }).uiSettings;

      configGet = jest.fn(() => ({
        enabled: true,
        auth: {
          type: 'basicauth',
        },
      }));
      coreContext = setupCoreContextMock({ configGet });
    });

    test('restApiEnbled', () => {
      let configService = new ConfigService({
        uiSettings,
        coreContext,
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
        uiSettings,
        coreContext,
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
        uiSettings,
        coreContext,
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
        uiSettings,
        coreContext,
        config: {
          systeminfo: {
            modules: {},
          },
          restapiinfo: {},
        },
      });

      expect(configService.hasApiAccess()).toBe(false);

      configService = new ConfigService({
        uiSettings,
        coreContext,
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
        uiSettings,
        coreContext,
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
        uiSettings,
        coreContext,
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
        uiSettings,
        coreContext,
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
        uiSettings,
        coreContext,
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
        uiSettings,
        coreContext,
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
        uiSettings,
        coreContext,
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
        uiSettings,
        coreContext,
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

    test('licenseRequired', () => {
      let configService = new ConfigService({
        uiSettings,
        coreContext,
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
        uiSettings,
        coreContext,
        config: {
          systeminfo: {},
        },
      });

      expect(configService.licenseRequired()).toBe(false);
    });

    test('licenseValid', () => {
      let configService = new ConfigService({
        uiSettings,
        coreContext,
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
        uiSettings,
        coreContext,
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
        uiSettings,
        coreContext,
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
        uiSettings,
        coreContext,
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
        uiSettings,
        coreContext,
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
        uiSettings,
        coreContext,
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
        uiSettings,
        coreContext,
        config: {
          systeminfo: {},
        },
      });

      expect(configService.licenseExpiresIn()).toBe(0);
    });
  });
});
