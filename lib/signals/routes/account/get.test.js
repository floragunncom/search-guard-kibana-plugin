import Hapi from 'hapi';
import getAccountRoute from './get';
import { ROUTE_PATH } from '../../../../utils/signals/constants';

describe('routes/account/get', () => {
  describe('there are some results', () => {
    let mockResponse;
    let callWithRequestFactoryStub;
    let server;

    beforeEach(() => {
      mockResponse = {
        _id: 'email/mymailserver',
        found: true,
        _version: 18,
        _seq_no: 23,
        _primary_term: 4,
        _source: {
          mime_layout: 'default',
          port: 1025,
          default_subject: 'SG Signals Message',
          host: 'localhost',
          type: 'EMAIL',
          session_timeout: 120000
        }
      };

      callWithRequestFactoryStub = jest.fn();
      callWithRequestFactoryStub
        .mockReturnValue(() => new Promise(resolve => resolve(JSON.parse(JSON.stringify(mockResponse)))));

      server = new Hapi.Server();
      server.route(getAccountRoute(server, callWithRequestFactoryStub));
    });

    it('responds with 200', async () => {
      const { result, statusCode } = await server.inject({
        method: 'get',
        url: `${ROUTE_PATH.ACCOUNT}/${mockResponse._id}`
      });

      expect(statusCode).toBe(200);
      expect(result.ok).toBe(true);
      expect(result.resp).toEqual({
        _id: 'mymailserver',
        ...mockResponse._source
      });
    });
  });

  describe('there is an error', () => {
    it('bad implementation', async () => {
      const callWithRequestFactoryStub = jest.fn();
      callWithRequestFactoryStub
        .mockReturnValue(() => Promise.reject(new Error('nasty error')));

      const server = new Hapi.Server();
      server.route(getAccountRoute(server, callWithRequestFactoryStub));

      const { result, statusCode } = await server.inject({
        method: 'get',
        url: `${ROUTE_PATH.ACCOUNT}/email/id`
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
      server.route(getAccountRoute(server, callWithRequestFactoryStub));

      const { result, statusCode } = await server.inject({
        method: 'get',
        url: `${ROUTE_PATH.ACCOUNT}/email/id`
      });

      expect(statusCode).toBe(200);
      expect(result.ok).toBe(false);
      expect(result.resp.statusCode).toBe(400);
      expect(result.resp.message).toBe('elasticsearch error');
      expect(result.resp.body).toEqual(mockResponse.body);
    });
  });
});