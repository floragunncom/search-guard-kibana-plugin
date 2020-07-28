/* eslint-disable @kbn/eslint/require-license-header */
import { instantiateConfig } from './searchguard';
import { ConfigService } from '../../../utils/config_service';
import { setupApiServiceMock, setupCoreMock, setupCoreContextMock } from '../../utils/mocks';

describe('SearchGuard', () => {
  describe('instantiateConfig', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    test('instantiate config if NOT authenticated', async () => {
      const core = setupCoreMock({
        uiSettingsGetImplementation: () => true,
      });

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
        loadKibanaConfigImplementation: () => Promise.reject(error401),
      });

      const configService = await instantiateConfig({ core, apiService, coreContext });

      expect(configService).toBeInstanceOf(ConfigService);
      expect(configService.getConfig()).toEqual({
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
        is_dark_mode: true,
      });
    });

    test('instantiate config if authenticated', async () => {
      const core = setupCoreMock({
        uiSettingsGetImplementation: () => true,
      });

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

      const configService = await instantiateConfig({ core, apiService, coreContext });

      expect(configService).toBeInstanceOf(ConfigService);
      expect(configService.getConfig()).toEqual({
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
        is_dark_mode: true,
      });
    });
  });
});
