import Hapi from 'hapi'; // eslint-disable-line import/no-extraneous-dependencies
import queryString from 'query-string';
import getAlertsRoute from './get';
import { ROUTE_PATH } from '../../../../utils/signals/constants';

describe('routes/alerts/get', () => {
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
      server.route(getAlertsRoute(server, callWithRequestFactoryStub, fetchAllFromScrollStub));
    });

    it('responds with 200', async () => {
      const { result, statusCode } = await server.inject({
        method: 'get',
        url: `${ROUTE_PATH.ALERTS}?${queryString.stringify({
          dateGte: 'now-30m',
          dateLt: 'now',
          dateField: 'execution_end'
        })}`
      });

      expect(statusCode).toBe(200);
      expect(result.ok).toBe(true);
      expect(result.resp).toEqual([
        { _index: 'log', _id: '123', a: 'b' },
        { _index: 'log', _id: '456', c: 'd' }
      ]);
    });
  });

  describe('there is an error', () => {
    it('bad implementation', async () => {
      const callWithRequestFactoryStub = jest.fn();
      callWithRequestFactoryStub
        .mockReturnValue(() => Promise.reject(new Error('nasty error')));

      const server = new Hapi.Server();
      server.route(getAlertsRoute(server, callWithRequestFactoryStub));

      const { result, statusCode } = await server.inject({
        method: 'get',
        url: `${ROUTE_PATH.ALERTS}?${queryString.stringify({
          dateGte: 'now-30m',
          dateLt: 'now',
          dateField: 'execution_end'
        })}`
      });

      expect(statusCode).toBe(200);
      expect(result.ok).toBe(false);
      expect(result.resp.statusCode).toBe(500);
      expect(result.resp.message).toBe('nasty error');
    });

    it('elasticsearch error', async () => {
      const mockResponse = {
        body: {
          status: {},
          watch_id: '123',
          error: {
            message: 'elasticsearch error',
            detail: {}
          }
        },
        statusCode: 400
      };

      const callWithRequestFactoryStub = jest.fn();
      callWithRequestFactoryStub
        .mockReturnValue(() => Promise.reject(JSON.parse(JSON.stringify(mockResponse))));

      const server = new Hapi.Server();
      server.route(getAlertsRoute(server, callWithRequestFactoryStub));

      const { result, statusCode } = await server.inject({
        method: 'get',
        url: `${ROUTE_PATH.ALERTS}?${queryString.stringify({
          dateGte: 'now-30m',
          dateLt: 'now',
          dateField: 'execution_end'
        })}`
      });

      expect(statusCode).toBe(200);
      expect(result.ok).toBe(false);
      expect(result.resp.statusCode).toBe(400);
      expect(result.resp.message).toBe('elasticsearch error');
      expect(result.resp.body).toEqual(mockResponse.body);
    });
  });
});
