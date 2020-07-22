/* eslint-disable @kbn/eslint/require-license-header */
import { ConfigService } from './config_service';

describe('ConfigService', () => {
  test('can get config on path', () => {
    const configService = new ConfigService({
      searchguard: {
        cookies: {
          password: 'password',
        },
      },
    });

    expect(configService.get('searchguard.cookies.password')).toBe('password');
  });

  test('fail to get config on path', () => {
    const configService = new ConfigService({});

    expect(configService.get('searchguard.cookies.password')).toBe(undefined);
  });

  test('set a default value if fail to get config on path', () => {
    const configService = new ConfigService({});

    expect(configService.get('searchguard.cookies.password', 'password')).toBe('password');
  });

  test('the config is immutable', () => {
    const configService = new ConfigService({ a: 1, b: { c: 2 } });

    let config = configService.getConfig();
    config.a = 2;

    expect(configService.config).toEqual({ a: 1, b: { c: 2 } });

    config = configService.get('b');
    config.c = 1;

    expect(configService.config).toEqual({ a: 1, b: { c: 2 } });
  });

  test('set config', () => {
    const configService = new ConfigService({ a: 1, b: { c: 2 } });
    configService.set('b.c', 3);

    expect(configService.config).toEqual({ a: 1, b: { c: 3 } });
  });

  describe('searchguard config', () => {
    test('get config', () => {
      const configService = new ConfigService({ a: 1, searchguard: { c: 2 } });

      expect(configService.getSearchguardConfig('c')).toEqual(2);
    });

    test('set config', () => {
      const configService = new ConfigService({ a: 1, searchguard: { c: 2 } });
      configService.setSearchguardConfig('c', 3);

      expect(configService.config).toEqual({ a: 1, searchguard: { c: 3 } });
    });

    test('throw error if wrong path', () => {
      const configService = new ConfigService({ a: 1, searchguard: { c: 2 } });

      expect(() => configService.setSearchguardConfig('searchguard.c', 3)).toThrow(
        new Error('The path must not start with "searchguard".')
      );
    });
  });

  describe('dynamic config', () => {
    test('get config', () => {
      const configService = new ConfigService({ a: 1, dynamic: { c: 2 } });

      expect(configService.getDynamicConfig('c')).toEqual(2);
    });

    test('set config', () => {
      const configService = new ConfigService({ a: 1, dynamic: { c: 2 } });
      configService.setDynamicConfig('c', 3);

      expect(configService.config).toEqual({ a: 1, dynamic: { c: 3 } });
    });

    test('throw error if wrong path', () => {
      const configService = new ConfigService({ a: 1, dynamic: { c: 2 } });

      expect(() => configService.setDynamicConfig('dynamic.c', 3)).toThrow(
        new Error('The path must not start with "dynamic".')
      );
    });
  });

  describe('helpers', () => {
    test('restApiEnbled', () => {
      let configService = new ConfigService({
        systeminfo: {
          modules: {
            REST_MANAGEMENT_API: {},
          },
        },
      });

      expect(configService.restApiEnabled()).toBe(true);

      configService = new ConfigService({
        systeminfo: {
          modules: {},
        },
      });

      expect(configService.restApiEnabled()).toBe(false);
    });

    test('hasApiAccess', () => {
      let configService = new ConfigService({
        systeminfo: {
          modules: {
            REST_MANAGEMENT_API: {},
          },
        },
        restapiinfo: {
          has_api_access: true,
        },
      });

      expect(configService.hasApiAccess()).toBe(true);

      configService = new ConfigService({
        systeminfo: {
          modules: {},
        },
        restapiinfo: {},
      });

      expect(configService.hasApiAccess()).toBe(false);

      configService = new ConfigService({
        systeminfo: {
          modules: {
            REST_MANAGEMENT_API: {},
          },
        },
        restapiinfo: {},
      });

      expect(configService.hasApiAccess()).toBe(false);

      configService = new ConfigService({
        systeminfo: {
          modules: {},
        },
        restapiinfo: {
          has_api_access: true,
        },
      });

      expect(configService.hasApiAccess()).toBe(false);
    });

    test('dlsFlsEnabled', () => {
      let configService = new ConfigService({
        systeminfo: {
          modules: {
            DLSFLS: {},
          },
        },
      });

      expect(configService.dlsFlsEnabled()).toBe(true);

      configService = new ConfigService({
        systeminfo: {
          modules: {},
        },
      });

      expect(configService.dlsFlsEnabled()).toBe(false);
    });

    test('multiTenancyEnabled', () => {
      let configService = new ConfigService({
        systeminfo: {
          modules: {
            MULTITENANCY: {},
          },
        },
      });

      expect(configService.multiTenancyEnabled()).toBe(true);

      configService = new ConfigService({
        systeminfo: {
          MULTITENANCY: {},
        },
      });

      expect(configService.multiTenancyEnabled()).toBe(false);
    });

    test('compliancyFeaturesEnabled', () => {
      let configService = new ConfigService({
        systeminfo: {
          sg_license: {
            features: ['COMPLIANCE'],
          },
        },
      });

      expect(configService.complianceFeaturesEnabled()).toBe(true);

      configService = new ConfigService({
        systeminfo: {
          sg_license: {
            features: [],
          },
        },
      });

      expect(configService.complianceFeaturesEnabled()).toBe(false);
    });

    test('endpointAndMethodEnabled', () => {
      let configService = new ConfigService({
        restapiinfo: {},
      });

      expect(configService.endpointAndMethodEnabled()).toBe(false);

      configService = new ConfigService({
        restapiinfo: { disabled_endpoints: {} },
      });

      expect(configService.endpointAndMethodEnabled()).toBe(true);

      configService = new ConfigService({
        restapiinfo: { disabled_endpoints: { a: [] } },
      });

      expect(configService.endpointAndMethodEnabled('a', 'b')).toBe(true);

      configService = new ConfigService({
        restapiinfo: { disabled_endpoints: { a: ['b'] } },
      });

      expect(configService.endpointAndMethodEnabled('a', 'b')).toBe(false);
    });

    test('licenseRequired', () => {
      let configService = new ConfigService({
        systeminfo: {
          sg_license: {
            license_required: true,
          },
        },
      });

      expect(configService.licenseRequired()).toBe(true);

      configService = new ConfigService({
        systeminfo: {},
      });

      expect(configService.licenseRequired()).toBe(false);
    });

    test('licenseValid', () => {
      let configService = new ConfigService({
        systeminfo: {
          sg_license: {
            is_valid: true,
            license_required: true,
          },
        },
      });

      expect(configService.licenseValid()).toBe(true);

      configService = new ConfigService({
        systeminfo: {
          sg_license: {
            license_required: false,
          },
        },
      });

      expect(configService.licenseValid()).toBe(true);

      configService = new ConfigService({
        systeminfo: {
          sg_license: {
            is_valid: false,
            license_required: true,
          },
        },
      });

      expect(configService.licenseValid()).toBe(false);
    });

    test('isTrialLicense', () => {
      let configService = new ConfigService({
        systeminfo: {
          sg_license: {
            license_required: false,
          },
        },
      });

      expect(configService.isTrialLicense()).toBe(false);

      configService = new ConfigService({
        systeminfo: {
          sg_license: {
            license_required: true,
            type: 'TRIAL',
          },
        },
      });

      expect(configService.isTrialLicense()).toBe(true);
    });

    test('licenseExpiresIn', () => {
      let configService = new ConfigService({
        systeminfo: {
          sg_license: {
            expiry_in_days: 1,
          },
        },
      });

      expect(configService.licenseExpiresIn()).toBe(1);

      configService = new ConfigService({
        systeminfo: {},
      });

      expect(configService.licenseExpiresIn()).toBe(0);
    });
  });
});
