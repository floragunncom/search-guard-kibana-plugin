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

export class AuthManager {
  constructor({ configService, sessionStorageFactory }) {
    this.authTypeName = null;
    this.authInstance = null;
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

  setAuthInstance(authTypeName, authInstance) {
    this.authTypeName = authTypeName;
    this.authInstance = authInstance;
  }

  checkAuth = async (request, response, toolkit) => {
    if (this.routesToIgnore.includes(request.url.pathname)) {
      // @todo This should probable be toolkit.authenticated(), but that threw an error.
      // Change back after everything has been implemented
      return toolkit.notHandled();
    }

    if (this.unauthenticatedRoutes.includes(request.url.pathname)) {
      // @todo Why does this work? If we return notHandled here, searchguard throws an error.
      // If we do this, we don't really assign any relevant headers
      // Until now, we got the kibana server user here, but those credentials were
      // not really used, it seems
      return toolkit.authenticated({
        requestHeaders: request.headers,
      });
    }

    if (this.authInstance) {
      return this.authInstance.checkAuth(request, response, toolkit);
    } else {
      // @todo "sync" with existing cookie here?
      const sessionCookie = (await this.sessionStorageFactory.asScoped(request).get()) || {};
    }

    console.log('------ Redirecting for', request.url.path);

    return response.redirected({
      headers: {
        location: `/auth`,
      },
    });
  };

  getAllAuthHeaders(request) {
    if (this.authInstance) {
      return this.authInstance.getAllAuthHeaders(request);
    }

    return false;
  }
}
