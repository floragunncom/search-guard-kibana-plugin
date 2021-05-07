/* eslint-disable @kbn/eslint/require-license-header */
/**
 *    Copyright 2018 floragunn GmbH

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

import AuthType from '../AuthType';
import MissingRoleError from '../../errors/missing_role_error';
import { ensureRawRequest } from '../../../../../../../../src/core/server/http/router';
import { defineRoutes } from './routes';
import { APP_ROOT } from '../../../../../utils/constants';
import { stringify } from 'querystring';
import {AUTH_TYPE_NAMES} from "../../AuthManager";

export default class BasicAuth extends AuthType {
  constructor({
    searchGuardBackend,
    kibanaCore,
    config,
    logger,
    sessionStorageFactory,
    elasticsearch,
    pluginDependencies,
    authManager,
  }) {
    super({
      searchGuardBackend,
      kibanaCore,
      config,
      logger,
      sessionStorageFactory,
      elasticsearch,
      pluginDependencies,
      authManager
    });

    /**
     * The authType is saved in the auth cookie for later reference
     * @type {string}
     */
    this.type = AUTH_TYPE_NAMES.BASIC;

    /**
     * The name of the authorization header to be used
     * @type {string}
     */
    this.authHeaderName = 'authorization';

    /**
     * Redirect to a loadbalancer url instead of a relative path when unauthenticated?
     * @type {boolean}
     */
    this.loadBalancerURL = this.config.get('searchguard.basicauth.loadbalancer_url');

    /**
     * Allow anonymous access?
     * @type {boolean}
     */
    this.anonymousAuthEnabled = this.config.get('searchguard.auth.anonymous_auth_enabled');

    this.handleUnauthenticated();
  }

  debugLog(message, label = AUTH_TYPE_NAMES.BASIC) {
    super.debugLog(message, label);
  }

  /**
   * Handle the case where a logged in user's password was changed
   * and we receive a 401 despite having a valid auth cookie.
   * The main goal here is to make sure that the cookie is deleted,
   * and also to prevent the browser auth dialog from showing up.
   *
   * The user would still see a screen with an error message,
   * but after a page reload they will be redirectd to the
   * login page. This is expected.
   *
   * @todo Investigate if we can safely just automatically
   * redirect to the login page using OnUnAuthenticted()
   */
  handleUnauthenticated() {
    this.kibanaCore.http.registerOnPreResponse(async (request, response, toolkit) => {
      try {
        // @todo Try to get away from Hapi here
        request = ensureRawRequest(request);

        let has401 = false;
        if (request.response.statusCode === 401) {
          has401 = true;
        } else if (request.response.output && request.response.output.statusCode === 401) {
          has401 = true;
        }

        if (has401) {
          // Make sure we don't have an auth cookie anymore if we receive a 401.
          // Most likely, the current user's password was changed, leading to the 401.
          await this.clear(request);
          if (request.response.output && request.response.output.headers) {
            delete request.response.output.headers['WWW-Authenticate'];
            delete request.response.wwwAuthenticateDirective;
          }
          this.debugLog(
            'Received a 401 auth exception. If we had a cookie, the password was most likely changed elsewhere',
            'basicAuth'
          );

          // @todo Maybe we just redirect to the login page here? return this.onUnAuthenticated(...)
        }
      } catch (error) {
        this.logger.error(`An error occurred while checking for 401 Unauthorized: ${error.stack}`);
      }

      return toolkit.next();
    });
  }

  /**
   * Checks if we have an authorization header.
   *
   * Pass the existing session credentials to compare with the authorization header.
   *
   * @param request
   * @param sessionCredentials
   * @returns {object|null} - credentials for the authentication
   */
  detectAuthHeaderCredentials(request, sessionCredentials = null) {
    if (request.headers[this.authHeaderName]) {
      const authHeaderValue = request.headers[this.authHeaderName];
      const headerTrumpsSession = this.config.get('searchguard.basicauth.header_trumps_session');

      // If we have sessionCredentials AND auth headers we need to check if they are the same.
      if (sessionCredentials !== null && sessionCredentials.authHeaderValue === authHeaderValue) {
        // The auth header credentials are the same as those in the session,
        // no need to return new credentials so we're just nulling the token here
        return null;
      }

      // We may have an auth header for a different user than the user saved in the session.
      // To avoid confusion, we do NOT override the cookie user, unless explicitly configured to do so.
      if (sessionCredentials !== null && !headerTrumpsSession) {
        return null;
      }

      return {
        authHeaderValue: authHeaderValue,
      };
    }

    return null;
  }

  async authenticate(credentials, options = {}, additionalAuthHeaders = {}) {
    // A login can happen via a POST request (login form) or when we have request headers with user credentials.
    // We also need to re-authenticate if the credentials (headers) don't match what's in the session.
    try {
      const user = await this.searchGuardBackend.authenticateWithHeader(
        this.authHeaderName,
        credentials.authHeaderValue,
        additionalAuthHeaders
      );
      const session = {
        username: user.username,
        credentials: credentials,
        authType: this.type,
        isAnonymousAuth: options && options.isAnonymousAuth === true ? true : false,
      };

      if (this.sessionTTL) {
        session.expiryTime = Date.now() + this.sessionTTL;
      }

      return {
        session,
        user,
      };
    } catch (error) {
      throw error;
    }
  }

  getRedirectTargetForUnauthenticated(request, error = null, isAJAX = false) {
    const queryParamsObject = {};
    if (!isAJAX) {
      queryParamsObject.nextUrl = this.getNextUrl(request);
    }

    let redirectTo = `${this.basePath}${APP_ROOT}/login`;

    if (error && error instanceof MissingRoleError) {
      queryParamsObject.type = 'missingRole';
      redirectTo = this.basePath + '/customerror';
    }

    if (this.anonymousAuthEnabled) {
      redirectTo = `${this.basePath}${APP_ROOT}/auth/anonymous`;
    }

    if (this.loadBalancerURL) {
      redirectTo = `${this.loadBalancerURL}${this.basePath}${APP_ROOT}/login`;
    }
    const queryParameterString = stringify(queryParamsObject);

    return queryParameterString ? `${redirectTo}?${queryParameterString}` : `${redirectTo}`;
  }

  onUnAuthenticated(request, response, toolkit, error = null) {
    const redirectTo = this.getRedirectTargetForUnauthenticated(request, error);

    return response.redirected({
      headers: {
        location: `${redirectTo}`,
      },
    });
  }

  setupRoutes() {
    defineRoutes({
      authInstance: this,
      searchGuardBackend: this.searchGuardBackend,
      kibanaCore: this.kibanaCore,
      kibanaConfig: this.config,
      sessionStorageFactory: this.sessionStorageFactory,
      logger: this.logger,
      authManager: this.authManager,
    });
  }
}
