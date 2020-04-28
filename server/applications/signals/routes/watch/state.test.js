/* eslint-disable @kbn/eslint/require-license-header */
import { stateOfWatch } from './state';
import { elasticsearchMock, httpRouteMock, setupLoggerMock } from '../../../../utils/mocks';
import {
  mockResponseOkImplementation,
  mockElasticsearchError,
  mockErrorResponse,
  mockSuccessResponse,
  mockElasticsearchErrorResponse,
} from '../mocks';

const { setupClusterClientMock, setupClusterClientScopedMock } = elasticsearchMock;
const { setupRequestMock, setupResponseMock } = httpRouteMock;

// TODO: mock http router to test entire route lifecycle.
// Now we test only the route's handler.
describe('routes/watch/state', () => {
  let mockHandlerRequest;
  let mockHandlerResponse;

  describe('there are some results', () => {
    let mockResponse;
    let mockClusterClient;

    beforeEach(() => {
      mockResponse = {
        actions: {
          my_action: {
            last_triggered: '2019-12-05T14:21:50.025735Z',
            last_triage: '2019-12-05T14:21:50.025735Z',
            last_triage_result: true,
            last_execution: '2019-12-05T14:21:50.025735Z',
            last_error: '2019-12-03T11:17:50.129348Z',
            last_status: {
              code: 'ACTION_TRIGGERED',
            },
            acked: {
              on: '2019-12-05T14:23:21.373254Z',
              by: 'test_user',
            },
            execution_count: 20,
          },
        },
        last_execution: {
          data: {
            my_data: {
              hits: {
                hits: [],
                total: {
                  value: 1,
                  relation: 'eq',
                },
                max_score: 1,
              },
            },
          },
          severity: {
            level: 'error',
            level_numeric: 3,
            mapping_element: {
              threshold: 1,
              level: 'error',
            },
            value: 1,
          },
          trigger: {
            scheduled_time: '2019-12-05T14:21:50Z',
            triggered_time: '2019-12-05T14:21:50.006Z',
          },
          execution_time: '2019-12-05T14:21:50.009277Z',
        },
        last_status: {
          code: 'ACTION_TRIGGERED',
        },
        node: 'my_node',
      };

      const mockClusterClientScoped = setupClusterClientScopedMock();
      mockClusterClientScoped.callAsCurrentUser.mockReturnValue(mockResponse);

      mockClusterClient = setupClusterClientMock();
      mockClusterClient.asScoped.mockReturnValue(mockClusterClientScoped);
    });

    it('responds with 200', async () => {
      const mockHandlerRequest = setupRequestMock();
      mockHandlerRequest.params.id = 'awatch';

      const mockHandlerResponse = setupResponseMock();
      mockHandlerResponse.ok.mockImplementation(mockResponseOkImplementation);

      const result = await stateOfWatch({ clusterClient: mockClusterClient })(
        null,
        mockHandlerRequest,
        mockHandlerResponse
      );

      expect(result).toEqual(mockSuccessResponse(mockResponse));
    });
  });

  describe('there is an error', () => {
    let logger;

    beforeEach(() => {
      logger = setupLoggerMock();
      mockHandlerRequest = setupRequestMock();
      mockHandlerRequest.params.id = 'awatch';
      mockHandlerResponse = setupResponseMock();
      mockHandlerResponse.ok.mockImplementation(mockResponseOkImplementation);
    });

    it('bad implementation', async () => {
      const mockClusterClientScoped = setupClusterClientScopedMock();
      mockClusterClientScoped.callAsCurrentUser.mockRejectedValue(new Error('nasty error'));

      const mockClusterClient = setupClusterClientMock();
      mockClusterClient.asScoped.mockReturnValue(mockClusterClientScoped);

      const result = await stateOfWatch({ clusterClient: mockClusterClient, logger })(
        null,
        mockHandlerRequest,
        mockHandlerResponse
      );

      expect(result).toEqual(mockErrorResponse('nasty error'));
      expect(logger.error.mock.calls.length).toBe(1);
    });

    it('elasticsearch error', async () => {
      const mockClusterClientScoped = setupClusterClientScopedMock();
      mockClusterClientScoped.callAsCurrentUser.mockRejectedValue(mockElasticsearchError());

      const mockClusterClient = setupClusterClientMock();
      mockClusterClient.asScoped.mockReturnValue(mockClusterClientScoped);

      const result = await stateOfWatch({ clusterClient: mockClusterClient, logger })(
        null,
        mockHandlerRequest,
        mockHandlerResponse
      );

      expect(result).toEqual(mockElasticsearchErrorResponse(mockElasticsearchError()));
      expect(logger.error.mock.calls.length).toBe(1);
    });
  });
});
