import Hapi from 'hapi';
import getIndicesRoute from './get_indices';
import { BASE_URI } from '../../../../utils/signals/constants';

describe('routes/es/get_indices', () => {
  describe('there are some results', () => {
    it('responds with 200', async () => {
      const mockResponse = {
        aggregations: {
          indices: {
            buckets: [
              {
                key: 'index_a',
                doc_count: 65494
              },
              {
                key: 'index_b',
                doc_count: 14005
              },
              {
                key: 'index_c',
                doc_count: 13059
              }
            ]
          }
        }
      };

      const callWithRequestFactoryStub = jest.fn();
      callWithRequestFactoryStub
        .mockReturnValue(() => new Promise(resolve => resolve(mockResponse)));

      const server = new Hapi.Server();
      server.route(getIndicesRoute(server, callWithRequestFactoryStub));

      const { result, statusCode } = await server.inject({
        method: 'post',
        url: `${BASE_URI}/_indices`,
        payload: {
          index: '*'
        }
      });

      expect(statusCode).toBe(200);
      expect(result.ok).toBe(true);
      expect(result.resp).toEqual([
        {
          health: 'green',
          index: 'index_a',
          status: 'open'
        },
        {
          health: 'green',
          index: 'index_b',
          status: 'open'
        },
        {
          health: 'green',
          index: 'index_c',
          status: 'open'
        }
      ]);
    });

    it('no aggregations', async () => {
      const callWithRequestFactoryStub = jest.fn();
      callWithRequestFactoryStub
        .mockReturnValue(() => new Promise(resolve => resolve({})));

      const server = new Hapi.Server();
      server.route(getIndicesRoute(server, callWithRequestFactoryStub));

      const { result, statusCode } = await server.inject({
        method: 'post',
        url: `${BASE_URI}/_indices`,
        payload: {
          index: '*'
        }
      });

      expect(statusCode).toBe(200);
      expect(result.ok).toBe(true);
      expect(result.resp).toEqual([]);
    });
  });

  describe('there is an error', () => {
    it('bad implementation', async () => {
      const callWithRequestFactoryStub = jest.fn();
      callWithRequestFactoryStub
        .mockReturnValue(() => Promise.reject(new Error('nasty error')));

      const server = new Hapi.Server();
      server.route(getIndicesRoute(server, callWithRequestFactoryStub));

      const { result, statusCode } = await server.inject({
        method: 'post',
        url: `${BASE_URI}/_indices`,
        payload: {
          index: '*'
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
      server.route(getIndicesRoute(server, callWithRequestFactoryStub));

      const { result, statusCode } = await server.inject({
        method: 'post',
        url: `${BASE_URI}/_indices`,
        payload: {
          index: '*'
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
