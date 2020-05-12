/* eslint-disable @kbn/eslint/require-license-header */
import Hapi from 'hapi';
import { getAliasesRoute } from './get_aliases';
import { BASE_URI } from '../../../../../utils/signals/constants';
import { elasticsearchMock, setupLoggerMock } from '../../../../utils/mocks';

const { setupClusterClientMock, setupClusterClientScopedMock } = elasticsearchMock;

describe('routes/es/get_aliases', () => {
  describe('there are some results', () => {
    let mockResponse;
    let server;

    beforeEach(() => {
      mockResponse = [
        {
          alias: 'testindex_alias',
          index: 'testindex',
        },
        {
          alias: '.kibana',
          index: '.kibana_2',
        },
      ];

      const mockClusterClientScoped = setupClusterClientScopedMock();
      mockClusterClientScoped.callAsCurrentUser.mockReturnValue(mockResponse);

      const mockClusterClient = setupClusterClientMock();
      mockClusterClient.asScoped.mockReturnValue(mockClusterClientScoped);

      server = new Hapi.Server();
      getAliasesRoute({ hapiServer: server, clusterClient: mockClusterClient });
    });

    it('responds with 200', async () => {
      const { result, statusCode } = await server.inject({
        method: 'post',
        url: `${BASE_URI}/_aliases`,
        payload: {
          alias: '*',
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
      getAliasesRoute({ hapiServer: server, clusterClient: mockClusterClient, logger });

      const { result, statusCode } = await server.inject({
        method: 'post',
        url: `${BASE_URI}/_aliases`,
        payload: {
          alias: '*',
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
      getAliasesRoute({ hapiServer: server, clusterClient: mockClusterClient, logger });

      const { result, statusCode } = await server.inject({
        method: 'post',
        url: `${BASE_URI}/_aliases`,
        payload: {
          alias: '*',
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
