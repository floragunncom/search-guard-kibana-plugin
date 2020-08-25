/**
 *    Copyright 2020 floragunn GmbH

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

export function redirectOnSessionTimeout(authType, coreHttp, isAnonymousAuth = false) {
  if (!authType) {
    return;
  }

  coreHttp.intercept({
    responseError: async httpResponse => {
      if (!httpResponse.response || httpResponse.response.status !== 401) {
        return;
      }

      const errorBody = httpResponse.error.body || {};

      // Handles 401s, but only if we've explicitly set the redirect property on the response
      // or if we're using basic auth
      if (authType !== 'basicauth' && errorBody.redirectTo !== 'login') {
        return;
      }

      const APP_ROOT = coreHttp.basePath.get();
      const path = coreHttp.basePath.remove(window.location.pathname);

      // Don't run on login or logout. We shouldn't have any Ajax requests here,
      // but if other plugins are active, we would get a redirect loop.
      if (path === '/login' || path === '/logout' || path === '/customerror') {
        return;
      }

      let nextUrl = path + window.location.hash + window.location.search;
      let redirectTarget = null;

      if (authType === 'jwt') {
        // For JWT we don't have a login page, so we need to go to the custom error page
        redirectTarget = `${APP_ROOT}/customerror?type=sessionExpired`;
        nextUrl = null;
      } else {
        if (authType === 'openid') {
          redirectTarget = `${APP_ROOT}/auth/openid/login`;
        } else if (authType === 'saml') {
          redirectTarget = `${APP_ROOT}/auth/saml/login`;
        } else {
          // Handle differently if we were logged in anonymously
          if (isAnonymousAuth && authType === 'basicauth') {
            redirectTarget = `${APP_ROOT}/auth/anonymous`;
          } else {
            redirectTarget = `${APP_ROOT}/login`;
          }
        }
      }

      if (redirectTarget) {
        if (nextUrl) {
          redirectTarget = `${redirectTarget}?nextUrl=${encodeURIComponent(nextUrl)}`;
        }

        window.location.href = redirectTarget;
      }
    },
  });
}
