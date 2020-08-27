/* eslint-disable @kbn/eslint/require-license-header */
import { executeWatch } from './execute';
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
describe('routes/watch/execute', () => {
  let mockHandlerRequest;
  let mockHandlerResponse;

  describe('there are some results', () => {
    let mockResponse;
    let mockClusterClient;

    beforeEach(() => {
      mockResponse = {
        data: {
          mysearch: {
            _shards: {},
            hits: {
              hits: [
                { _id: '123', _source: { a: 'b' } },
                { _id: '456', _source: { c: 'd' } },
              ],
            },
          },
        },
      };

      const mockClusterClientScoped = setupClusterClientScopedMock();
      mockClusterClientScoped.callAsCurrentUser.mockReturnValue(mockResponse);

      mockClusterClient = setupClusterClientMock();
      mockClusterClient.asScoped.mockReturnValue(mockClusterClientScoped);
    });

    it('responds with 200', async () => {
      const mockHandlerRequest = setupRequestMock();
      mockHandlerRequest.body = {
        watch: {
          trigger: {},
          checks: [],
          actions: [],
          _meta: {},
        },
      };

      const mockHandlerResponse = setupResponseMock();
      mockHandlerResponse.ok.mockImplementation(mockResponseOkImplementation);

      const result = await executeWatch({ clusterClient: mockClusterClient })(
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
      mockHandlerRequest.body = {
        watch: {
          trigger: {},
          checks: [],
          actions: [],
          _meta: {},
        },
      };
      mockHandlerResponse = setupResponseMock();
      mockHandlerResponse.ok.mockImplementation(mockResponseOkImplementation);
    });

    it('bad implementation', async () => {
      const mockClusterClientScoped = setupClusterClientScopedMock();
      mockClusterClientScoped.callAsCurrentUser.mockRejectedValue(new Error('nasty error'));

      const mockClusterClient = setupClusterClientMock();
      mockClusterClient.asScoped.mockReturnValue(mockClusterClientScoped);

      const result = await executeWatch({ clusterClient: mockClusterClient, logger })(
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

      const result = await executeWatch({ clusterClient: mockClusterClient, logger })(
        null,
        mockHandlerRequest,
        mockHandlerResponse
      );

      expect(result).toEqual(mockElasticsearchErrorResponse(mockElasticsearchError()));
      expect(logger.error.mock.calls.length).toBe(1);
    });
  });
});
