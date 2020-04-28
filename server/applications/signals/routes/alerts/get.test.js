/* eslint-disable @kbn/eslint/require-license-header */
import Hapi from 'hapi'; // eslint-disable-line import/no-extraneous-dependencies
import { getAlertsRoute } from './get';
import { ROUTE_PATH } from '../../../../../utils/signals/constants';
import { elasticsearchMock } from '../../../../utils/mocks';

const { setupClusterClientMock, setupClusterClientScopedMock } = elasticsearchMock;

describe('routes/alerts/get_by_query', () => {
  describe('there are some results', () => {
    let mockResponse;
    let server;

    beforeEach(() => {
      mockResponse = [
        { _index: 'log', _id: '123', _source: { a: 'b' } },
        { _index: 'log', _id: '456', _source: { c: 'd' } },
      ];

      const mockClusterClientScoped = setupClusterClientScopedMock();
      mockClusterClientScoped.callAsCurrentUser.mockReturnValue(mockResponse);

      const mockClusterClient = setupClusterClientMock();
      mockClusterClient.asScoped.mockReturnValue(mockClusterClientScoped);

      const mockFetchAllFromScroll = jest.fn();
      mockFetchAllFromScroll.mockResolvedValue(mockResponse);

      server = new Hapi.Server();
      getAlertsRoute({
        hapiServer: server,
        clusterClient: mockClusterClient,
        fetchAllFromScroll: mockFetchAllFromScroll,
      });
    });

    it('responds with 200', async () => {
      const { result, statusCode } = await server.inject({
        method: 'post',
        url: `${ROUTE_PATH.ALERTS}`,
        headers: {
          sgtenant: 'admin_tenant',
        },
        payload: {
          query: {},
        },
      });

      expect(statusCode).toBe(200);
      expect(result.ok).toBe(true);
      expect(result.resp).toEqual([
        { _index: 'log', _id: '123', a: 'b' },
        { _index: 'log', _id: '456', c: 'd' },
      ]);
    });
  });
});
