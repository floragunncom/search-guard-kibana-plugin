/*
 *    Copyright 2025 floragunn GmbH
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

import { assign } from 'lodash';
import { ensureRawRequest } from '@kbn/core-http-router-server-internal';

/**
 * Proxy to session token
 *
 * This is a standalone authentication handler that doesn't extend AuthType,
 * similar to Kerberos authentication.
 */
export class Proxy {
  constructor(props) {
    this.type = 'proxy';
    this.logger = props.logger;
    this.config = props.config;
    this.searchGuardBackend = props.searchGuardBackend;
    this.authDebugEnabled = this.config.get('searchguard.auth.debug');
    this.basePath = props.basePath ? props.basePath : '/';
    this.sessionStorageFactory = props.sessionStorageFactory;
    this.unauthenticatedRoutes = this.config.get('searchguard.auth.unauthenticated_routes');
  }

  /**
   * Main authentication check handler registered in onPreAuth lifecycle.
   * Validates existing sessions or authenticates with proxy headers.
   *
   * @param {object} request - The HTTP request
   * @param {object} response - The HTTP response
   * @param {object} toolkit - Hapi toolkit
   * @returns {Promise<*>}
   */
  checkAuth = async (request, response, toolkit) => {
    try {
      if (request.route.options.authRequired === false) {
        return toolkit.next();
      }
    } catch (error) {
      this.debugLog('Could not read auth options for the path: ' + request.url.pathname)
    }

    if (this.unauthenticatedRoutes.includes(request.route.path)) {
      return toolkit.next();
    }

    try {
      const sessionCookie = await this.getCookieWithCredentials(request, 'checkAuth');

      // Add auth headers to the request for downstream handlers
      const rawRequest = ensureRawRequest(request);
      assign(rawRequest.headers, this.getAuthHeader(sessionCookie));

      return toolkit.next();
    } catch (error) {
      // For proxy auth, if authentication fails, return 401
      // TODO REDIRECT TO LOGIN PAGE OR ERROR PAGE WITH ERROR MESSAGE? This will just lead to a redirect loop.
      return response.unauthorized({
        body: {
          message: 'Proxy authentication failed. Please ensure the reverse proxy is properly configured.',
        },
      });
    }
  };

  async getCookieWithCredentials(request) {
    let sessionCookie = (await this.sessionStorageFactory.asScoped(request).get()) || {};

    if (sessionCookie.credentials && sessionCookie.credentials.authHeaderValue) {
      const headers = {authorization: sessionCookie.credentials.authHeaderValue};

      try {
        const authInfoResponse = await this.searchGuardBackend.authinfo(headers);
        return sessionCookie;
      } catch (error) {
        // We will try to get the cookie
        this.debugLog('Proxy auth session expired, re-authenticating')
      }

    } else {
      this.debugLog('No session found, authenticating with proxy headers');
    }

    return this.authenticateWithProxyHeaders(request, sessionCookie);
  }

  /**
   * Create a session token with the given request headers
   *
   * @param {object} request - The HTTP request
   * @param {object} sessionCookie - The session cookie
   * @returns {Promise<Object>}
   */
  async authenticateWithProxyHeaders(request, sessionCookie) {
    try {
      const headers = request.headers;

      this.debugLog('Attempting proxy header authentication');

      // Create a session using the proxy headers
      const createSessionResponse = await this.searchGuardBackend.createSessionWithHeaders(headers);

      if (this.authDebugEnabled) {
        this.logger.debug(
          `Proxy auth authenticated: ${JSON.stringify(createSessionResponse, null, 2)}`
        );
      }

      // Get the bearer token from the session response
      const authHeaders = { authorization: 'Bearer ' + createSessionResponse.token };

      // Validate the token and get user info
      const user = await this.searchGuardBackend.authenticateWithHeader(
        'authorization',
        authHeaders.authorization
      );

      // Update the session cookie with credentials
      sessionCookie.username = user.username;
      sessionCookie.credentials = {
        authHeaderValue: authHeaders.authorization,
      };

      // Save the session cookie
      await this.sessionStorageFactory.asScoped(request).set(sessionCookie);
      this.debugLog(`Proxy auth successful for user: ${user.username}`);

      return sessionCookie;
    } catch (error) {
      this.logger.error(`Proxy authentication failed: ${error.stack}`);
      throw error;
    }
  }

  /**
   * Get auth header from the session cookie.
   *
   * @param {object} session - The session object
   * @returns {object|boolean} - Auth headers or false
   */
  getAuthHeader(session) {
    if (session.credentials && session.credentials.authHeaderValue) {
      return {
        authorization: session.credentials.authHeaderValue,
      };
    }

    return false;
  }

  /**
   * Debug logging helper.
   *
   * @param {string} message - The message to log
   */
  debugLog(message) {
    if (this.authDebugEnabled) {
      try {
        if (typeof message !== 'string') {
          message = JSON.stringify(message);
        }
        this.logger.info(`[Proxy Auth] ${message}`);
      } catch (error) {
        this.logger.error(`Error in debug log: ${error.stack}`);
      }
    }
  }
}
