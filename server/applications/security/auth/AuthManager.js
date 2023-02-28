/*
 * Copyright 2023 Excelerate Technology Limited T/A Eliatra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * *    Copyright 2021 floragunn GmbH
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

import { ensureRawRequest, KibanaResponse } from '../../../../../../src/core/server/http/router';
import { assign } from 'lodash';
import path from 'path';

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
    eliatraSuiteBackend,
    configService,
  }) {
    this.kibanaCore = kibanaCore;
    this.sessionStorageFactory = sessionStorageFactory;
    this.eliatraSuiteBackend = eliatraSuiteBackend;
    this.logger = logger;
    this.pluginDependencies = pluginDependencies;
    this.configService = configService;
    this.authInstances = {};
    this.unauthenticatedRoutes = this.configService.get('eliatra.security.auth.unauthenticated_routes');

    /**
     * Loading bundles are now behind auth.
     * We need to skip auth for the bundles for the login page and the error page
     */
    this.routesToIgnore = [
      //'/login',
      '/customerror',
      '/bootstrap.js',
      '/bundles/app/core/bootstrap.js',
      '/bundles/app/security-customerror/bootstrap.js',
      // SAML specific
      '/security/saml/acs',
      '/security/saml/acs/idpinitiated',
      '/security/saml/logout',
    ];

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
        eliatraSuiteBackend: this.eliatraSuiteBackend,
        config: this.configService,
        authManager: this, // @todo Is the authManager used?
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

    if (request.headers.authorization) {
      return toolkit.authenticated({
        requestHeaders: { authorization: request.headers.authorization },
      });
    }

    if (this.routesToIgnore.includes(request.url.pathname)) {
      // Change back after everything has been implemented
      return toolkit.notHandled();
    }

    if (this.unauthenticatedRoutes.includes(request.url.pathname)) {
      // If we do this, we don't really assign any relevant headers
      // Until now, we got the kibana server user here, but those credentials were
      // not really used, it seems
      return toolkit.authenticated({
      });
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
      this.configService.get('eliatra.security.auth.anonymous_auth_enabled')
    ) {
      return toolkit.authenticated({
      });
    }

    const isAjaxRequest = request.headers
         && ((request.headers.accept && request.headers.accept.split(',').indexOf('application/json') > -1) || (request.headers['content-type'] && request.headers['content-type'].indexOf('application/json') > -1));

    const nextUrl = this.getNextUrl(request);
    let loginPageURL = this.basePath + '/login' + `?nextUrl=${nextUrl}`;

    try {
      const authConfig = await this.eliatraSuiteBackend.getAuthConfig(nextUrl);

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
      if (request.route.path === '/api/core/capabilities') {
	    return toolkit.notHandled();
      }

      // If the session has expired, we may receive ajax requests that can't handle a 302 redirect.
      // In this case, we trigger a 401 and let the interceptor handle the redirect on the client side.
      return response.unauthorized({
        headers: {
          sp_redirectTo: loginPageURL,
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
