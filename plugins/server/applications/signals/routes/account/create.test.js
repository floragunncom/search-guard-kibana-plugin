/* eslint-disable @kbn/eslint/require-license-header */
import Hapi from 'hapi';
import { createAccountRoute } from './create';
import { ROUTE_PATH } from '../../../../../utils/signals/constants';
import { elasticsearchMock, setupLoggerMock } from '../../../../utils/mocks';

const { setupClusterClientMock, setupClusterClientScopedMock } = elasticsearchMock;

describe('routes/account/create', () => {
  describe('there are some results', () => {
    let mockResponse;
    let server;

    beforeEach(() => {
      mockResponse = {
        _id: 'mydest',
        _version: 21,
        result: 'created',
      };

      const mockClusterClientScoped = setupClusterClientScopedMock();
      mockClusterClientScoped.callAsCurrentUser.mockReturnValue(mockResponse);

      const mockClusterClient = setupClusterClientMock();
      mockClusterClient.asScoped.mockReturnValue(mockClusterClientScoped);

      server = new Hapi.Server();
      createAccountRoute({ hapiServer: server, clusterClient: mockClusterClient });
    });

    it('responds with 200', async () => {
      const { result, statusCode } = await server.inject({
        method: 'put',
        url: `${ROUTE_PATH.ACCOUNT}/email/id`,
        payload: {
          type: 'EMAIL',
          host: 'localhost',
          port: 4088,
          mime_layout: 'default',
          session_timeout: 120000,
          default_subject: 'SG Signals message',
        },
      });

      expect(statusCode).toBe(200);
      expect(result.ok).toBe(true);
      expect(result.resp).toEqual(mockResponse);
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
      createAccountRoute({ hapiServer: server, clusterClient: mockClusterClient, logger });

      const { result, statusCode } = await server.inject({
        method: 'put',
        url: `${ROUTE_PATH.ACCOUNT}/email/id`,
        payload: {
          type: 'EMAIL',
          host: 'localhost',
          port: 4088,
          mime_layout: 'default',
          session_timeout: 120000,
          default_subject: 'SG Signals message',
        },
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
      createAccountRoute({ hapiServer: server, clusterClient: mockClusterClient, logger });

      const { result, statusCode } = await server.inject({
        method: 'put',
        url: `${ROUTE_PATH.ACCOUNT}/email/id`,
        payload: {
          type: 'EMAIL',
          host: 'localhost',
          port: 4088,
          mime_layout: 'default',
          session_timeout: 120000,
          default_subject: 'SG Signals message',
        },
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
