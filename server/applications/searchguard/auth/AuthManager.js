/*
 *    Copyright 2021 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { KibanaResponse } from '@kbn/core-http-server';
import { assign } from 'lodash';
import path from 'path';
import { ensureRawRequest } from '@kbn/core-http-router-server-internal';

export const AUTH_TYPE_NAMES = {
  BASIC: 'basicauth',
  OIDC: 'openid',
  JWT: 'jwt',
  SAML: 'saml',
};

export class AuthManager {
  constructor({
    kibanaCore,
    sessionStorageFactory,
    pluginDependencies,
    logger,
    searchGuardBackend,
    configService,
    spacesService,
  }) {
    this.kibanaCore = kibanaCore;
    this.sessionStorageFactory = sessionStorageFactory;
    this.searchGuardBackend = searchGuardBackend;
    this.logger = logger;
    this.pluginDependencies = pluginDependencies;
    this.configService = configService;
    this.spacesService = spacesService;
    this.authInstances = {};
    this.unauthenticatedRoutes = this.configService.get('searchguard.auth.unauthenticated_routes');

    /**
     * We used to have a list of paths that auth should ignore.
     * Now, we check the route options instead - if no auth
     * is required, we just skip the path.
     *
     * Keeping this in case there are exceptions to this rule.
     */
    this.routesToIgnore = [];

    this.basePath = kibanaCore.http.basePath.get();
  }

  registerAuthInstances() {
    [
      require('./types/openid/OpenId'),
      require('./types/basicauth/BasicAuth'),
      require('./types/jwt/Jwt'),
      require('./types/saml/Saml'),
    ].forEach((AuthClass) => {
      // @todo This needs to respect the order as given by the backend
      const authInstance = new AuthClass({
        kibanaCore: this.kibanaCore,
        sessionStorageFactory: this.sessionStorageFactory,
        pluginDependencies: this.pluginDependencies,
        logger: this.logger,
        searchGuardBackend: this.searchGuardBackend,
        config: this.configService,
        authManager: this, // @todo Is the authManager used?
        spacesService: this.spacesService
      });

      authInstance.init();
      this.authInstances[authInstance.type] = authInstance;
    });
  }

  registerAuthInstance(authTypeName, authInstance) {
    this.authInstances[authTypeName] = authInstance;
  }

  getAuthInstanceByName(authTypeName) {
    if (this.authInstances[authTypeName]) {
      return this.authInstances[authTypeName];
    }

    return null;
  }

  async getAuthInstanceByRequest({ request }) {
    const matchedAuthInstance = await this.getAuthInstanceByAuthTypes({ request });
    // matchedAuthInstance will be null if we didn't get a match
    if (matchedAuthInstance) {
      return matchedAuthInstance;
    }

    const authInstanceByCookie = await this.getAuthInstanceByCookie({ request });
    if (authInstanceByCookie) {
      return authInstanceByCookie;
    }

    return null;
  }

  async getAuthInstanceByAuthTypes({ request }) {
    for (const authType in this.authInstances) {
      const authInstance = this.getAuthInstanceByName(authType);
      const authInstanceResult = await authInstance.detectCredentialsByRequest({ request });
      if (authInstanceResult !== null) {
        return authInstance;
      }
    }

    return null;
  }

  async getAuthInstanceByCookie({ request }) {
    const sessionCookie = (await this.sessionStorageFactory.asScoped(request).get()) || {};
    if (sessionCookie.authType && this.authInstances[sessionCookie.authType]) {
      return this.getAuthInstanceByName(sessionCookie.authType);
    }

    return null;
  }

  /**
   * This needs to be the very first onPreAuth handler that
   * we register for the plugin
   * @param request
   * @param response
   * @param toolkit
   * @returns {Promise<*>}
   */
  onPreAuth = async (request, response, toolkit) => {
    if (request.headers.authorization) {
      const sessionCookie = (await this.sessionStorageFactory.asScoped(request).get()) || {};
      const authInstance = await this.getAuthInstanceByCookie({ request });
      if (sessionCookie.credentials && authInstance) {
        // In case we already had a session BEFORE we encountered a request
        // with auth headers, we may need to clear the cookie.
        // Make sure to clear any auth related cookie info if we detect a different header
        await authInstance.clear(request, true);
      }
    }
    return toolkit.next();
  };

  checkAuth = async (request, response, toolkit) => {
    const sessionCookie = (await this.sessionStorageFactory.asScoped(request).get()) || {};

    /**
     * If we have an auth header, just let the request pass through
     */
    if (request.headers.authorization) {
      return toolkit.next();
    }

    try {
      if (request.route.options.authRequired === false) {
        return toolkit.next();
      }
    } catch (error) {
      this.logger.info('Could not read auth options for the path: ' + request.url.pathname)
    }

    /**
     * This block isn't really needed since we started checking
     * the route's auth options, but leaving it in case there
     * are any edge cases
     */
    if (this.routesToIgnore.includes(request.url.pathname) || request.url.pathname.indexOf('/bundle') > -1) {
      return toolkit.next();
    }


    /**
     * This block isn't really needed since we started checking
     * the route's auth options, but leaving it in case there
     * are any edge cases.
     * These routes are used configurable.
     */
    if (this.unauthenticatedRoutes.includes(request.url.pathname)) {
      // If we do this, we don't really assign any relevant headers
      // Until now, we got the kibana server user here, but those credentials were
      // not really used, it seems

     return toolkit.next();
    }

    const authInstanceByRequest = await this.getAuthInstanceByRequest({ request });
    if (authInstanceByRequest) {
      return authInstanceByRequest.checkAuth(request, response, toolkit);
    }

    // @todo This way of handling anonymous auth unfortunately
    // doesn't provide a good way of showing an error message
    // if the SG backend hasn't been configured properly
    if (
      !sessionCookie.authType &&
      this.configService.get('searchguard.auth.anonymous_auth_enabled')
    ) {
      /*
      return toolkit.authenticated({
      });
      */

      return toolkit.next();
    }

    // Here comes the not authenticated logic...

    // We don't have any cookie, but we may have an optional auth
    try {
      if (request.route.options.authRequired === 'optional') {
        return toolkit.next();
      }
    } catch (error) {
      this.logger.info('Could not read auth options for the path: ' + request.url.pathname)
    }

    const isAjaxRequest = request.headers 
         && ((request.headers.accept && request.headers.accept.split(',').indexOf('application/json') > -1) || (request.headers['content-type'] && request.headers['content-type'].indexOf('application/json') > -1));

    const nextUrl = this.getNextUrl(request);
    let loginPageURL = this.basePath + '/searchguard/login' + `?nextUrl=${nextUrl}`;

    try {
      const authConfig = await this.searchGuardBackend.getAuthConfig(nextUrl);

      if (authConfig && authConfig.auth_methods && authConfig.auth_methods.length == 1 && authConfig.auth_methods[0].sso_location) {
        const config = authConfig.auth_methods[0];
        loginPageURL = config.sso_location;

        const authInstance = this.authInstances[config.method == "oidc" ? "openid": config.method];
        if (authInstance && authInstance.loginURL) {
          loginPageURL = new URL(this.basePath + authInstance.loginURL, 'http://abc');

          if (config.id) {
            loginPageURL.searchParams.set('authTypeId', config.id);
          }

          if (nextUrl) {
            loginPageURL.searchParams.set('nextUrl', nextUrl);
          }

          loginPageURL = loginPageURL.href.replace(loginPageURL.origin, '');
        }

        if (config.capture_url_fragment && nextUrl && !isAjaxRequest) {
           return response.redirected({
              headers: {
                 'location': `${this.basePath}/auth/captureurlfragment?loginHandler=${this.basePath + authInstance.loginURL}&authTypeId=${config.id}&nextUrl=${encodeURIComponent(nextUrl)}`,
              },
           });
        }
      }
    } catch (error) {
        console.error("Error while retrieving auth config", error);
    }

    if (isAjaxRequest) {
      // If the session has expired, we may receive ajax requests that can't handle a 302 redirect.
      // In this case, we trigger a 401 and let the interceptor handle the redirect on the client side.
      return response.unauthorized({
        headers: {
          sg_redirectTo: loginPageURL,
        },
        body: { message: 'Session expired or invalid username and password' },
      });
    }

    return response.redirected({
      headers: {
        location: loginPageURL,
      },
    });
  };

  /**
   * Handler for validating the auth state in routes with authRequired === optional.
   *
   * Our auth logic runs in the onPreAuth lifecycle step, and
   * we let requests with optional auth pass through.
   *
   * Subsequently, Kibana's auth logic will consider the
   * request authenticated in the default auth logic.
   *
   * If the optional route's handler behaves differently
   * for authenticated request and makes calls to the
   * backend, we may run into unexpected 401s.
   *
   * This handler tries to sync the authentication
   * status with the rest of our auth logic.
   * If there's no authorization header attached to the
   * request, we will consider it unauthenticated.
   *
   * @see https://github.com/elastic/kibana/blob/6c438b331c703c507af524a13aab634cdbfbbb13/dev_docs/tutorials/endpoints.mdx?plain=1#L399
   *
   * @param request
   * @param response
   * @param toolkit
   * @returns {Promise<*>}
   */
  handleAuthForOptionalRoutes = async (request, response, toolkit) => {
    try {
      if (request.route.options.authRequired === 'optional' && !request.headers.authorization) {
        const rawRequest = ensureRawRequest(request);
        rawRequest.auth.isAuthenticated = false;
      }
    } catch (error) {
      this.logger.info('handleAuthForOptionalRoute could not read auth options for the path: ' + request.url.pathname)
    }

    return toolkit.next();
  }

  /**
   * Handler for validating the auth state in routes with authRequired === optional.
   *
   * Our auth logic runs in the onPreAuth lifecycle step, and
   * we let requests with optional auth pass through.
   *
   * Subsequently, Kibana's auth logic will consider the
   * request authenticated in the default auth logic.
   *
   * If the optional route's handler behaves differently
   * for authenticated request and makes calls to the
   * backend, we may run into unexpected 401s.
   *
   * This handler tries to sync the authentication
   * status with the rest of our auth logic.
   * If there's no authorization header attached to the
   * request, we will consider it unauthenticated.
   *
   * @see https://github.com/elastic/kibana/blob/6c438b331c703c507af524a13aab634cdbfbbb13/dev_docs/tutorials/endpoints.mdx?plain=1#L399
   *
   * @param request
   * @param response
   * @param toolkit
   * @returns {Promise<*>}
   */
  handleAuthForOptionalRoutes = async (request, response, toolkit) => {
    try {
      if (request.auth.isAuthenticated === true && request.route.options.authRequired === 'optional' && !request.headers.authorization) {
        // Set isAuthenticated to false
        if (['/login'].indexOf(request.url.pathname) === -1) {
          const rawRequest = ensureRawRequest(request);
          rawRequest.auth.isAuthenticated = false;
        }
      }
    } catch (error) {
      this.logger.info('handleAuthForOptionalRoute could not read auth options for the path: ' + request.url.pathname)
    }

    return toolkit.next();
  }

  // @todo Not needed for 7.10?
  onPostAuth = async (request, response, toolkit) => {
    if (request.route.path === '/api/core/capabilities') {      
      if (this.configService.get('searchguard.auth.anonymous_auth_enabled')) return toolkit.next();

      const authHeaders = await this.getAllAuthHeaders(request);

      if (authHeaders === false && !request.headers.authorization) {
        /*
        We need this redirect because Kibana calls the capabilities on our login page. The Kibana checks if there is the default space in the Kibana index.
        The problem is that the Kibana call is scoped to the current request. And the current request doesn't contain any credentials in the headers because the user hasn't been authenticated yet.
        As a result, the call fails with 401, and the user sees the Kibana error page instead of our login page.
        We flank this issue by redirecting the Kibana call to our route /api/v1/searchguard/kibana_capabilities where we serve some
        minimum amount of capabilities. We expect that Kibana fetches the capabilities again once the user logged in.
        */
        // The payload is passed together with the redirect despite of the undefined here
        return new KibanaResponse(307, undefined, {
          headers: { location: this.basePath + '/api/v1/searchguard/kibana_capabilities' },
        });
      }
    }

    return toolkit.next();
  };

  getNextUrl(request) {
    let nextUrl = path.posix.join(this.basePath, request.url.pathname);
    if (request.url.search) nextUrl += request.url.search;

    return nextUrl;
  }

  /**
   * Get credentials from an existing cookie only
   * @param request
   * @returns {Promise<*|boolean|boolean>}
   */
  async getAuthHeader(request) {
    const authInstance = await this.getAuthInstanceByCookie({ request });
    if (authInstance) {
      // @todo A bit weird that we have different method signatures here
      const sessionCookie = (await this.sessionStorageFactory.asScoped(request).get()) || {};
      return authInstance.getAuthHeader(sessionCookie);
    }
    return false;
  }

  async getAllAuthHeaders(request) {
    if (request.headers.authorization) {
      return false;
    }
    const authInstance = await this.getAuthInstanceByRequest({ request });
    if (authInstance) {
      return authInstance.getAllAuthHeaders(request);
    }

    return false;
  }

  async logout({ context, request, response }) {
    const authInstance = await this.getAuthInstanceByCookie({ request });
    if (authInstance) {
      return await authInstance.logout({ context, request, response });
    }

    return response.ok();
  }
}
