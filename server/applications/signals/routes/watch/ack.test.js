/* eslint-disable @kbn/eslint/require-license-header */
import { ackWatch } from './ack';
import { elasticsearchMock, httpRouteMock, setupLoggerMock } from '../../../../utils/mocks';
import {
  mockResponseOkImplementation,
  mockSuccessResponse,
  mockErrorResponse,
  mockElasticsearchErrorResponse,
  mockElasticsearchError,
} from '../mocks';

const { setupClusterClientMock, setupClusterClientScopedMock } = elasticsearchMock;
const { setupRequestMock, setupResponseMock } = httpRouteMock;

// TODO: mock http router to test entire route lifecycle.
// Now we test only the route's handler.
describe('routes/watch/ack', () => {
  let mockHandlerRequest;
  let mockHandlerResponse;

  describe('there are some results', () => {
    let mockResponse;
    let mockClusterClient;

    beforeEach(() => {
      mockResponse = { status: 200 };

      const mockClusterClientScoped = setupClusterClientScopedMock();
      mockClusterClientScoped.callAsCurrentUser.mockReturnValue(mockResponse);

      mockClusterClient = setupClusterClientMock();
      mockClusterClient.asScoped.mockReturnValue(mockClusterClientScoped);
    });

    it('responds with 200', async () => {
      const mockHandlerRequest = setupRequestMock();
      mockHandlerRequest.params.watchId = 'awatch';

      const mockHandlerResponse = setupResponseMock();
      mockHandlerResponse.ok.mockImplementation(mockResponseOkImplementation);

      const result = await ackWatch({ clusterClient: mockClusterClient })(
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
      mockHandlerRequest.params.watchId = 'awatch';

      mockHandlerResponse = setupResponseMock();
      mockHandlerResponse.ok.mockImplementation(mockResponseOkImplementation);
    });

    it('bad implementation', async () => {
      const mockClusterClientScoped = setupClusterClientScopedMock();
      mockClusterClientScoped.callAsCurrentUser.mockRejectedValue(new Error('nasty error'));

      const mockClusterClient = setupClusterClientMock();
      mockClusterClient.asScoped.mockReturnValue(mockClusterClientScoped);

      const result = await ackWatch({ clusterClient: mockClusterClient, logger })(
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

      const result = await ackWatch({ clusterClient: mockClusterClient, logger })(
        null,
        mockHandlerRequest,
        mockHandlerResponse
      );

      expect(result).toEqual(mockElasticsearchErrorResponse(mockElasticsearchError()));
      expect(logger.error.mock.calls.length).toBe(1);
    });
  });
});
