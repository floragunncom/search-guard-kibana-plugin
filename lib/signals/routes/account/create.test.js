import Hapi from 'hapi';
import createAccountRoute from './create';
import { ROUTE_PATH } from '../../../../utils/signals/constants';

describe('routes/account/create', () => {
  describe('there are some results', () => {
    let mockResponse;
    let callWithRequestFactoryStub;
    let server;

    beforeEach(() => {
      mockResponse = {
        _id: 'mydest',
        _version: 21,
        result: 'created'
      };

      callWithRequestFactoryStub = jest.fn();
      callWithRequestFactoryStub
        .mockReturnValue(() => new Promise(resolve =>
          resolve(JSON.parse(JSON.stringify(mockResponse)))));

      server = new Hapi.Server();
      server.route(createAccountRoute(server, callWithRequestFactoryStub));
    });

    it('responds with 200', async () => {
      const { result, statusCode } = await server.inject({
        method: 'put',
        url: `${ROUTE_PATH.ACCOUNT}/email/id`,
        payload: {
          type: 'EMAIL',
          host: 'localhost',
          port: 4088,
          mime_layout: 'default',
          session_timeout: 120000,
          default_subject: 'SG Signals message'
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
      server.route(createAccountRoute(server, callWithRequestFactoryStub));

      const { result, statusCode } = await server.inject({
        method: 'put',
        url: `${ROUTE_PATH.ACCOUNT}/email/id`,
        payload: {
          type: 'EMAIL',
          host: 'localhost',
          port: 4088,
          mime_layout: 'default',
          session_timeout: 120000,
          default_subject: 'SG Signals message'
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
      server.route(createAccountRoute(server, callWithRequestFactoryStub));

      const { result, statusCode } = await server.inject({
        method: 'put',
        url: `${ROUTE_PATH.ACCOUNT}/email/id`,
        payload: {
          type: 'EMAIL',
          host: 'localhost',
          port: 4088,
          mime_layout: 'default',
          session_timeout: 120000,
          default_subject: 'SG Signals message'
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
