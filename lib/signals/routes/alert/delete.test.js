import Hapi from 'hapi';
import deleteAlertRoute from './delete';
import { ROUTE_PATH } from '../../../../utils/signals/constants';

describe('routes/alert/delete', () => {
  describe('there are some results', () => {
    let mockResponse;
    let callWithRequestFactoryStub;
    let server;

    beforeEach(() => {
      mockResponse = {
        _index: 'log',
        result: 'deleted',
      };

      callWithRequestFactoryStub = jest.fn();
      callWithRequestFactoryStub
        .mockReturnValue(() => new Promise(resolve => resolve(mockResponse)));

      server = new Hapi.Server();
      server.route(deleteAlertRoute(server, callWithRequestFactoryStub));
    });

    it('responds with 200', async () => {
      const { result, statusCode } = await server.inject({
        method: 'delete',
        url: `${ROUTE_PATH.ALERT}/log/123`
      });

      expect(statusCode).toBe(200);
      expect(result.ok).toBe(true);
    });
  });

  describe('there is an error', () => {
    it('bad implementation', async () => {
      const callWithRequestFactoryStub = jest.fn();
      callWithRequestFactoryStub
        .mockReturnValue(() => Promise.reject(new Error('nasty error')));

      const server = new Hapi.Server();
      server.route(deleteAlertRoute(server, callWithRequestFactoryStub));

      const { result, statusCode } = await server.inject({
        method: 'delete',
        url: `${ROUTE_PATH.ALERT}/log/123`
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
      server.route(deleteAlertRoute(server, callWithRequestFactoryStub));

      const { result, statusCode } = await server.inject({
        method: 'delete',
        url: `${ROUTE_PATH.ALERT}/log/123`
      });

      expect(statusCode).toBe(200);
      expect(result.ok).toBe(false);
      expect(result.resp.statusCode).toBe(400);
      expect(result.resp.message).toBe('elasticsearch error');
      expect(result.resp.body).toEqual(mockResponse.body);
    });
  });
});
