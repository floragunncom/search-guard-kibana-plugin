import { MissingRoleError, MissingTenantError } from '../../../errors';
import { PATH } from '../../../../../utils/constants';
import { parseNextUrl } from '../../../parseNextUrl';

export default function createLoginRoute(server) {
  return {
    method: 'GET',
    path: PATH.LOGIN,
    async handler(request, h) {
      const loginApp = server.getHiddenUiAppById('searchguard-login');
      const config = server.config();
      const basePath = config.get('server.basePath');
      config.set('searchguard.basicauth.alternative_login.headers', ['authorization']);
      const alternativeHeaders = config.get('searchguard.basicauth.alternative_login.headers');
      try {
        // Check if we have alternative login headers
        // Alternative headers case: https://floragunn.atlassian.net/browse/ITT-1686
        if (alternativeHeaders && alternativeHeaders.length) {
          const requestHeaders = Object.keys(request.headers).map(header => header.toLowerCase());
          const foundHeaders = alternativeHeaders
            .filter(header => requestHeaders.indexOf(header.toLowerCase()) > -1);

          if (foundHeaders.length) {
            await request.auth.sgSessionStorage.authenticateWithHeaders(request.headers);

            let nextUrl = null;
            if (request.url && request.url.query && request.url.query.nextUrl) {
              nextUrl = parseNextUrl(request.url.query.nextUrl, basePath);
            }

            if (nextUrl) {
              nextUrl = parseNextUrl(nextUrl, basePath);
              return h.redirect(nextUrl);
            }

            return h.redirect(`${basePath}/app/kibana`);
          }
        }
      } catch (error) {
        if (error instanceof MissingRoleError) {
          return h.redirect(`${basePath}/customerror?type=missingRole`);
        }

        if (error instanceof MissingTenantError) {
          return h.redirect(`${basePath}/customerror?type=missingTenant`);
        }
        // Let normal authentication errors through(?) and just go to the regular login page?
      }

      return h.renderAppWithDefaultConfig(loginApp);
    },
    options: {
      auth: false
    }
  };
}
