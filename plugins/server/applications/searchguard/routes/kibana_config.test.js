/* eslint-disable @kbn/eslint/require-license-header */
import { handleKibanaConfig } from './kibana_config';
import { setupLoggerMock, httpRouteMock } from '../../../utils/mocks';

const { setupRequestMock, setupResponseMock } = httpRouteMock;

describe('searchguard/routes/kibana_config', () => {
  let mockHandlerRequest;
  let mockHandlerResponse;
  let mockLogger;

  beforeEach(() => {
    mockHandlerRequest = setupRequestMock();
    mockHandlerResponse = setupResponseMock();
    mockLogger = setupLoggerMock();
  });

  test('serve the config, pick only a limited set of options', async () => {
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

    const result = await handleKibanaConfig({
      config,
      logger: mockLogger,
    })(null, mockHandlerRequest, mockHandlerResponse);

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

    expect(mockLogger.debug.mock.calls.length).toBe(1);
    expect(mockLogger.debug).toHaveBeenCalledWith(
      'Serve the Kibana config:',
      JSON.stringify(expected, null, 2)
    );

    expect(result).toEqual({
      options: { body: expected },
      payload: expected,
      status: 200,
    });
  });
});
