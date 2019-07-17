import {
  createMockServer,
  getHiddenUiAppById,
  renderAppWithDefaultConfig,
  SgSessionStorage, // TODO: use real module when its code testable
} from '../../../../mock';
import createLoginRoute from './login';
import { PATH } from '../../../../../utils/constants';

describe(`GET ${PATH.LOGIN}`, () => {
  let server;

  beforeEach(async () => {
    server = createMockServer({
      'server.basePath': '',
      'searchguard.basicauth.alternative_login.headers': []
    });

    server.decorate('server', 'getHiddenUiAppById', id => getHiddenUiAppById(id));
    server.decorate('toolkit', 'renderAppWithDefaultConfig', app => renderAppWithDefaultConfig(app));
    server.ext('onPreAuth', (request, h) => {
      request.auth.sgSessionStorage = new SgSessionStorage();
      return h.continue;
    });

    server.route(createLoginRoute(server));
  });

  it('responds with 200', async () => {
    const res = await server.inject({
      method: 'get',
      url: PATH.LOGIN
    });

    expect(res.statusCode).toEqual(200);
  });

  it('redirects to /', async () => {
    const config = server.config();
    config.set('searchguard.basicauth.alternative_login.headers', ['authorization']);

    const res = await server.inject({
      method: 'get',
      url: `${PATH.LOGIN}?nextUrl=http://host.com:80/path`,
      headers: {
        authorization: 'Basic YWRtaW46YWRtaW4=',
        'user-agent': 'shot',
        host: 'localhost'
      }
    });

    const { statusCode, headers: { location } } = res;

    expect(statusCode).toEqual(302);
    expect(location).toEqual('/');
  });

  // TODO: add tests for errors when SgSessionStorage module is testable
});
