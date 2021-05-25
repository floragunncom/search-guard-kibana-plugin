/*
 *    Copyright 2020 floragunn GmbH
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

export const AUTH_TYPE_NAMES = {
  BASIC: 'basicauth',
  OIDC: 'openid',
};

export class AuthManager {
  constructor({ configService, sessionStorageFactory }) {
    this.authTypeName = null;
    this.authInstance = null;
    // @todo Where do we set these?
    this.authInstances = {};
    this.configService = configService;
    this.sessionStorageFactory = sessionStorageFactory;

    this.unauthenticatedRoutes = this.configService.get('searchguard.auth.unauthenticated_routes');

    /**
     * Loading bundles are now behind auth.
     * We need to skip auth for the bundles for the login page and the error page
     */
    this.routesToIgnore = [
      '/login',
      '/customerror',
      '/api/core/capabilities',
      '/bootstrap.js',
      '/bundles/app/core/bootstrap.js',
      '/bundles/app/searchguard-customerror/bootstrap.js',
    ];
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

  async getAuthInstanceByRequest(request) {
    // Checks cookie for authType
    const sessionCookie = (await this.sessionStorageFactory.asScoped(request).get()) || {};
    if (sessionCookie.authType && this.authInstances[sessionCookie.authType]) {
      return this.getAuthInstanceByName(sessionCookie.authType);
    }

    return null;
  }

  checkAuth = async (request, response, toolkit) => {
    if (this.routesToIgnore.includes(request.url.pathname)) {
      // Change back after everything has been implemented
      return toolkit.notHandled();
    }

    if (this.unauthenticatedRoutes.includes(request.url.pathname)) {
      // If we do this, we don't really assign any relevant headers
      // Until now, we got the kibana server user here, but those credentials were
      // not really used, it seems
      return toolkit.authenticated({
        requestHeaders: request.headers,
      });
    }

    // Detect authType. Keep in mind that we don't want to create a cookie based on headers only anymore.
    // @todo ProxyCache being the exception? Shouldn't matter at this place though
    const authInstanceByRequest = await this.getAuthInstanceByRequest(request);
    if (authInstanceByRequest) {
      return authInstanceByRequest.checkAuth(request, response, toolkit);
    }

    // Check for ajax requests
    // @todo Share this function with the authInstance?
    if (request.headers) {
      // If the session has expired, we may receive ajax requests that can't handle a 302 redirect.
      // In this case, we trigger a 401 and let the interceptor handle the redirect on the client side.
      if (
        (request.headers.accept &&
          request.headers.accept.split(',').indexOf('application/json') > -1) ||
        (request.headers['content-type'] &&
          request.headers['content-type'].indexOf('application/json') > -1)
      ) {

        return response.unauthorized({
          headers: {
            sg_redirectTo: '/login',
          },
          body: { message: 'Session expired' },
        });
      }
    }

    return response.redirected({
      headers: {
        location: `/login`,
      },
    });
  };

  async getAllAuthHeaders(request) {
    const authInstance = await this.getAuthInstanceByRequest(request);
    if (authInstance) {
      return authInstance.getAllAuthHeaders(request);
    }

    return false;
  }

  async logout({context, request, response}) {
    const authInstance = await this.getAuthInstanceByRequest(request);
    if (authInstance) {
      return await authInstance.logout({context, request, response});
    }

    return response.ok();
  }
}
