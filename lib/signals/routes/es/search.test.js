import Hapi from 'hapi';
import searchEsRoute from './search';
import { BASE_URI } from '../../../../utils/signals/constants';

describe('routes/es/search', () => {
  describe('there are some results', () => {
    let mockResponse;
    let callWithRequestFactoryStub;
    let server;

    beforeEach(() => {
      mockResponse = {
        hits: {
          hits: [
            { _id: '123', _source: { a: 'b' } },
            { _id: '456', _source: { c: 'd' } }
          ]
        }
      };

      callWithRequestFactoryStub = jest.fn();
      callWithRequestFactoryStub
        .mockReturnValue(() => new Promise(resolve =>
          resolve(JSON.parse(JSON.stringify(mockResponse)))));

      server = new Hapi.Server();
      server.route(searchEsRoute(server, callWithRequestFactoryStub));
    });

    it('responds with 200', async () => {
      const { result, statusCode } = await server.inject({
        method: 'post',
        url: `${BASE_URI}/_search`,
        payload: {
          index: 'signals_main_watches',
          size: 800,
          body: {
            query: {
              match_all: {}
            }
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
      server.route(searchEsRoute(server, callWithRequestFactoryStub));

      const { result, statusCode } = await server.inject({
        method: 'post',
        url: `${BASE_URI}/_search`,
        payload: {
          index: 'signals_main_watches',
          size: 800,
          body: {
            query: {
              match_all: {}
            }
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
      server.route(searchEsRoute(server, callWithRequestFactoryStub));

      const { result, statusCode } = await server.inject({
        method: 'post',
        url: `${BASE_URI}/_search`,
        payload: {
          index: 'signals_main_watches',
          size: 800,
          body: {
            query: {
              match_all: {}
            }
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
