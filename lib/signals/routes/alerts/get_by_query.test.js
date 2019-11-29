import Hapi from 'hapi'; // eslint-disable-line import/no-extraneous-dependencies
import { getAlertsByQueryRoute } from './get_by_query';
import { ROUTE_PATH } from '../../../../utils/signals/constants';

describe('routes/alerts/get_by_query', () => {
  describe('there are some results', () => {
    let mockResponse;
    let fetchAllFromScrollStub;
    let callWithRequestFactoryStub;
    let server;

    beforeEach(() => {
      mockResponse = [
        { _index: 'log', _id: '123', _source: { a: 'b' } },
        { _index: 'log', _id: '456', _source: { c: 'd' } }
      ];

      fetchAllFromScrollStub = jest.fn();
      fetchAllFromScrollStub
        .mockReturnValue(new Promise(resolve => resolve(mockResponse)));

      callWithRequestFactoryStub = jest.fn();
      callWithRequestFactoryStub
        .mockReturnValue(() => new Promise(resolve => resolve({
          hits: {
            hits: mockResponse
          }
        })));

      server = new Hapi.Server();
      server.route(getAlertsByQueryRoute(server, callWithRequestFactoryStub, fetchAllFromScrollStub));
    });

    it('responds with 200', async () => {
      const { result, statusCode } = await server.inject({
        method: 'post',
        url: `${ROUTE_PATH.ALERTS}`,
        payload: {
          body: {
            query: {
              bool: {}
            }
          }
        }
      });

      expect(statusCode).toBe(200);
      expect(result.ok).toBe(true);
      expect(result.resp).toEqual([
        { _index: 'log', _id: '123', a: 'b' },
        { _index: 'log', _id: '456', c: 'd' }
      ]);
    });
  });
});
