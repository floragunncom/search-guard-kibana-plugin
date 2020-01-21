import Hapi from 'hapi';
import executeWatchRoute from './execute';
import { ROUTE_PATH } from '../../../../utils/signals/constants';

describe('routes/watch/execute', () => {
  describe('there are some results', () => {
    let mockResponse;
    let callWithRequestFactoryStub;
    let server;

    beforeEach(() => {
      mockResponse = {
        data: {
          mysearch: {
            _shards: {},
            hits: {
              hits: [
                { _id: '123', _source: { a: 'b' } },
                { _id: '456', _source: { c: 'd' } }
              ]
            }
          }
        }
      };

      callWithRequestFactoryStub = jest.fn();
      callWithRequestFactoryStub
        .mockReturnValue(() => new Promise(resolve => resolve(mockResponse)));

      server = new Hapi.Server();
      server.route(executeWatchRoute(server, callWithRequestFactoryStub));
    });

    it('responds with 200', async () => {
      const { result, statusCode } = await server.inject({
        method: 'post',
        url: `${ROUTE_PATH.WATCH}/_execute`,
        headers: {
          sgtenant: 'admin_tenant'
        },
        payload: {
          watch: {
            trigger: {},
            checks: [],
            actions: [],
            _meta: {},
          },
        },
      });

      expect(statusCode).toBe(200);
      expect(result.ok).toBe(true);
      expect(result.resp).toEqual({
        data: {
          mysearch: {
            _shards: {},
            hits: {
              hits: [{ _id: '123', _source: { a: 'b' } }, { _id: '456', _source: { c: 'd' } }],
            },
          },
        },
      });
    });

    it('responds with 200 if Global tenant', async () => {
      const { result, statusCode } = await server.inject({
        method: 'post',
        url: `${ROUTE_PATH.WATCH}/_execute`,
        headers: {
          sgtenant: ''
        },
        payload: {
          watch: {
            trigger: {},
            checks: [],
            actions: [],
            _meta: {},
          },
        },
      });

      expect(statusCode).toBe(200);
      expect(result.ok).toBe(true);
      expect(result.resp).toEqual({
        data: {
          mysearch: {
            _shards: {},
            hits: {
              hits: [{ _id: '123', _source: { a: 'b' } }, { _id: '456', _source: { c: 'd' } }],
            },
          },
        },
      });
    });
  });

  describe('there is an error', () => {
    it('bad implementation', async () => {
      const callWithRequestFactoryStub = jest.fn();
      callWithRequestFactoryStub
        .mockReturnValue(() => Promise.reject(new Error('nasty error')));

      const server = new Hapi.Server();
      server.route(executeWatchRoute(server, callWithRequestFactoryStub));

      const { result, statusCode } = await server.inject({
        method: 'post',
        url: `${ROUTE_PATH.WATCH}/_execute`,
        headers: {
          sgtenant: 'admin_tenant'
        },
        payload: {
          watch: {
            trigger: {},
            checks: [],
            actions: [],
            _meta: {},
          },
        },
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
      server.route(executeWatchRoute(server, callWithRequestFactoryStub));

      const { result, statusCode } = await server.inject({
        method: 'post',
        url: `${ROUTE_PATH.WATCH}/_execute`,
        headers: {
          sgtenant: 'admin_tenant'
        },
        payload: {
          watch: {
            trigger: {},
            checks: [],
            actions: [],
            _meta: {},
          },
        },
      });

      expect(statusCode).toBe(200);
      expect(result.ok).toBe(false);
      expect(result.resp.statusCode).toBe(400);
      expect(result.resp.message).toBe('elasticsearch error');
      expect(result.resp.body).toEqual(mockResponse.body);
    });
  });
});