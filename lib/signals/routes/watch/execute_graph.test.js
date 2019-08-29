import Hapi from 'hapi';
import executeGraphWatchRoute from './execute_graph';
import { ROUTE_PATH } from '../../../../utils/signals/constants';

describe('routes/watch/execute_graph', () => {
  describe('there are some results', () => {
    let mockResponse;
    let callWithRequestFactoryStub;
    let server;

    beforeEach(() => {
      mockResponse = {
        hits: {
          total: {
            value: 71,
            relation: 'eq'
          },
          max_score: null,
          hits: []
        },
        aggregations: {
          over: {
            buckets: [
              {
                key_as_string: '2019-07-23T09:00:00.000Z',
                key: 1563872400000,
                doc_count: 9
              },
              {
                key_as_string: '2019-07-23T10:00:00.000Z',
                key: 1563876000000,
                doc_count: 19
              },
              {
                key_as_string: '2019-07-23T11:00:00.000Z',
                key: 1563879600000,
                doc_count: 15
              }
            ]
          }
        }
      };

      callWithRequestFactoryStub = jest.fn();
      callWithRequestFactoryStub
        .mockReturnValue(() => new Promise(resolve =>
          resolve(JSON.parse(JSON.stringify(mockResponse)))));

      server = new Hapi.Server();
      server.route(executeGraphWatchRoute(server, callWithRequestFactoryStub));
    });

    it('responds with 200', async () => {
      const { result, statusCode } = await server.inject({
        method: 'post',
        url: `${ROUTE_PATH.WATCH}/_execute_graph`,
        payload: {
          request: {
            indices: ['a', 'b'],
            body: {}
          }
        }
      });

      expect(statusCode).toBe(200);
      expect(result.ok).toBe(true);
      expect(result.resp).toEqual(mockResponse);
    });
  });

  describe('there is an error', () => {
    it('bad implementation', async () => {
      const callWithRequestFactoryStub = jest.fn();
      callWithRequestFactoryStub
        .mockReturnValue(() => Promise.reject(new Error('nasty error')));

      const server = new Hapi.Server();
      server.route(executeGraphWatchRoute(server, callWithRequestFactoryStub));

      const { result, statusCode } = await server.inject({
        method: 'post',
        url: `${ROUTE_PATH.WATCH}/_execute_graph`,
        payload: {
          request: {
            indices: ['a', 'b'],
            body: {}
          }
        }
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
      server.route(executeGraphWatchRoute(server, callWithRequestFactoryStub));

      const { result, statusCode } = await server.inject({
        method: 'post',
        url: `${ROUTE_PATH.WATCH}/_execute_graph`,
        payload: {
          request: {
            indices: ['a', 'b'],
            body: {}
          }
        }
      });


      expect(statusCode).toBe(200);
      expect(result.ok).toBe(false);
      expect(result.resp.statusCode).toBe(400);
      expect(result.resp.message).toBe('elasticsearch error');
      expect(result.resp.body).toEqual(mockResponse.body);
    });
  });
});
