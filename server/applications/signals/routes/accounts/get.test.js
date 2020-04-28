/* eslint-disable @kbn/eslint/require-license-header */
import Hapi from 'hapi';
import { getAccountsRoute } from './get';
import { ROUTE_PATH } from '../../../../../utils/signals/constants';
import { elasticsearchMock, setupLoggerMock } from '../../../../utils/mocks';

const { setupClusterClientMock, setupClusterClientScopedMock } = elasticsearchMock;

describe('routes/accounts/get', () => {
  describe('there are some results', () => {
    let mockResponse;
    let server;

    beforeEach(() => {
      mockResponse = [
        {
          _id: 'email/mymailserver',
          _index: '.signals_accounts',
          _source: {
            mime_layout: 'default',
            port: 1025,
            default_subject: 'SG Signals Message',
            host: 'localhost',
            type: 'EMAIL',
            session_timeout: 120000,
          },
        },
      ];

      const mockClusterClientScoped = setupClusterClientScopedMock();
      mockClusterClientScoped.callAsCurrentUser.mockReturnValue({
        hits: { hits: mockResponse },
      });

      const mockClusterClient = setupClusterClientMock();
      mockClusterClient.asScoped.mockReturnValue(mockClusterClientScoped);

      const mockFetchAllFromScroll = jest.fn();
      mockFetchAllFromScroll.mockResolvedValue(mockResponse);

      server = new Hapi.Server();
      getAccountsRoute({
        hapiServer: server,
        clusterClient: mockClusterClient,
        fetchAllFromScroll: mockFetchAllFromScroll,
      });
    });

    it('responds with 200', async () => {
      const { result, statusCode } = await server.inject({
        method: 'post',
        url: ROUTE_PATH.ACCOUNTS,
        payload: { query: {} },
      });

      expect(statusCode).toBe(200);
      expect(result.ok).toBe(true);
      expect(result.resp).toEqual([
        {
          _id: 'mymailserver',
          ...mockResponse[0]._source,
        },
      ]);
    });
  });

  describe('there is an error', () => {
    let logger;

    beforeEach(() => {
      logger = setupLoggerMock();
    });

    it('bad implementation', async () => {
      const mockClusterClientScoped = setupClusterClientScopedMock();
      mockClusterClientScoped.callAsCurrentUser.mockRejectedValue(new Error('nasty error'));

      const mockClusterClient = setupClusterClientMock();
      mockClusterClient.asScoped.mockReturnValue(mockClusterClientScoped);

      const server = new Hapi.Server();
      getAccountsRoute({ hapiServer: server, clusterClient: mockClusterClient, logger });

      const { result, statusCode } = await server.inject({
        method: 'post',
        url: ROUTE_PATH.ACCOUNTS,
        payload: { query: {} },
      });

      expect(statusCode).toBe(200);
      expect(result.ok).toBe(false);
      expect(result.resp.statusCode).toBe(500);
      expect(result.resp.message).toBe('nasty error');
      expect(logger.error.mock.calls.length).toBe(1);
    });

    it('elasticsearch error', async () => {
      const mockResponse = {
        body: {
          status: {},
          watch_id: '123',
          error: {
            message: 'elasticsearch error',
            detail: {},
          },
        },
        statusCode: 400,
      };

      const mockClusterClientScoped = setupClusterClientScopedMock();
      mockClusterClientScoped.callAsCurrentUser.mockRejectedValue(mockResponse);

      const mockClusterClient = setupClusterClientMock();
      mockClusterClient.asScoped.mockReturnValue(mockClusterClientScoped);

      const server = new Hapi.Server();
      getAccountsRoute({ hapiServer: server, clusterClient: mockClusterClient, logger });

      const { result, statusCode } = await server.inject({
        method: 'post',
        url: ROUTE_PATH.ACCOUNTS,
        payload: { query: {} },
      });

      expect(statusCode).toBe(200);
      expect(result.ok).toBe(false);
      expect(result.resp.statusCode).toBe(400);
      expect(result.resp.message).toBe('elasticsearch error');
      expect(result.resp.body).toEqual(mockResponse.body);
      expect(logger.error.mock.calls.length).toBe(1);
    });
  });
});
