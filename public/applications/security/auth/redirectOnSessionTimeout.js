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

export function redirectOnSessionTimeout(authType, coreHttp) {
  if (authType === 'kerberos' || authType === 'proxy') {
    return;
  }

  coreHttp.intercept({
    responseError: async (httpResponseError) => {
      const path = coreHttp.basePath.remove(window.location.pathname);

      // Don't run on login or logout. We shouldn't have any Ajax requests here,
      // but if other plugins are active, we would get a redirect loop.
      if (path === '/login' || path === '/logout' || path === '/customerror') {
        return;
      }

      const errorBody = httpResponseError.body || {};
      // We're only redirecting on 401s at the moment
      if (errorBody.statusCode !== 401) {
        return;
      }

      let redirectToFromHeader =
        httpResponseError && httpResponseError.response
          ? httpResponseError.response.headers.get('sp_redirectTo')
          : null;

      if (!redirectToFromHeader) {
        return;
      }

      const href = window.location.href;
      const nextUrl = href.replace(window.location.origin, '');

      try {
        // URLSearchParams should be safe now that IE11 support is dropped
        let searchParams = new URLSearchParams();
        if (redirectToFromHeader.indexOf('?') > -1) {
          const search = redirectToFromHeader.slice(redirectToFromHeader.indexOf('?'));
          redirectToFromHeader = redirectToFromHeader.replace(search, '');
          searchParams = new URLSearchParams(search);
        }

        if (nextUrl) {
          searchParams.append('nextUrl', nextUrl);
          redirectToFromHeader = `${redirectToFromHeader}?${searchParams.toString()}`;
        }
      } catch (error) {
        console.debug('Could not handle query parameters on the redirect url', error);
      }

      window.location.href = redirectToFromHeader;
    },
  });
}
