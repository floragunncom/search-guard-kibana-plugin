/* eslint-disable @kbn/eslint/require-license-header */
import { handleKibanaConfig } from './kibana_config';
import { setupLoggerMock, setupHttpResponseMock } from '../../../utils/mocks';

describe('searchguard/routes/kibana_config', () => {
  test.skip('serve the config, pick only a limited set of options', async () => {
    const request = {};
    const response = setupHttpResponseMock();
    const logger = setupLoggerMock();

    const config = {
      a: 1,
      elasticsearch: {
        b: 1,
        username: 'admin',
      },
      kibana: {
        c: 1,
        index: '.kibana',
      },
      searchguard: {
        d: 1,
        readonly_mode: {
          e: 1,
          roles: ['a', 'b'],
        },
        auth: {
          f: 1,
          type: 'basicauth',
        },
        multitenancy: {
          g: 1,
          enable_filter: true,
          show_roles: true,
          tenants: {
            h: 1,
            enable_private: true,
            enable_global: true,
            preferred: ['a', 'b'],
          },
        },
        accountinfo: {
          i: 1,
          enabled: true,
        },
      },
    };

    await handleKibanaConfig({
      config,
      logger: logger,
    })(null, request, response);

    const expected = {
      searchguard: {
        readonly_mode: {
          roles: ['a', 'b'],
        },
        auth: {
          type: 'basicauth',
        },
        multitenancy: {
          enable_filter: true,
          show_roles: true,
          tenants: {
            enable_private: true,
            enable_global: true,
            preferred: ['a', 'b'],
          },
        },
        accountinfo: {
          enabled: true,
        },
      },
      elasticsearch: {
        username: 'admin',
      },
      kibana: {
        index: '.kibana',
      },
    };

    expect(logger.debug.mock.calls.length).toBe(1);
    expect(logger.debug).toHaveBeenCalledWith(
      'Serve the Kibana config:',
      JSON.stringify(expected, null, 2)
    );
    expect(response.ok).toHaveBeenCalledWith({ body: expected });
  });
});
