import Hapi from 'hapi';
import getAliasesRoute from './get_aliases';
import { BASE_URI } from '../../../../utils/signals/constants';

describe('routes/es/get_aliases', () => {
  describe('there are some results', () => {
    let mockResponse;
    let callWithRequestFactoryStub;
    let server;

    beforeEach(() => {
      mockResponse = [
        {
          alias: 'testindex_alias',
          index: 'testindex'
        },
        {
          alias: '.kibana',
          index: '.kibana_2'
        }
      ];

      callWithRequestFactoryStub = jest.fn();
      callWithRequestFactoryStub
        .mockReturnValue(() => new Promise(resolve =>
          resolve(JSON.parse(JSON.stringify(mockResponse)))));

      server = new Hapi.Server();
      server.route(getAliasesRoute(server, callWithRequestFactoryStub));
    });

    it('responds with 200', async () => {
      const { result, statusCode } = await server.inject({
        method: 'post',
        url: `${BASE_URI}/_aliases`,
        payload: {
          alias: '*'
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
      server.route(getAliasesRoute(server, callWithRequestFactoryStub));

      const { result, statusCode } = await server.inject({
        method: 'post',
        url: `${BASE_URI}/_aliases`,
        payload: {
          alias: '*'
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
      server.route(getAliasesRoute(server, callWithRequestFactoryStub));

      const { result, statusCode } = await server.inject({
        method: 'post',
        url: `${BASE_URI}/_aliases`,
        payload: {
          alias: '*'
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
