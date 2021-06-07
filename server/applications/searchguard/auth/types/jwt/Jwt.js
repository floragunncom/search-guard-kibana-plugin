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
import MissingTenantError from '../../errors/missing_tenant_error';
import SessionExpiredError from '../../errors/session_expired_error';
import MissingRoleError from '../../errors/missing_role_error';
import path from 'path';
import { AUTH_TYPE_NAMES } from '../../AuthManager';

export default class Jwt extends AuthType {
  constructor({
    searchGuardBackend,
    kibanaCore,
    config,
    logger,
    sessionStorageFactory,
    pluginDependencies,
  }) {
    super({
      searchGuardBackend,
      kibanaCore,
      config,
      logger,
      sessionStorageFactory,
      pluginDependencies,
    });

    /**
     * The authType is saved in the auth cookie for later reference
     * @type {string}
     */
    this.type = AUTH_TYPE_NAMES.JWT;

    try {
      this.authHeaderName = this.config.get('searchguard.jwt.header').toLowerCase();
    } catch (error) {
      this.logger.warn('No authorization header name defined for JWT, using "authorization"');
      this.authHeaderName = 'authorization';
    }
  }

  debugLog(message, label = AUTH_TYPE_NAMES.JWT) {
    super.debugLog(message, label);
  }

  /**
   * Detect authorization header value, either as an http header or as a query parameter
   * @param request
   * @param sessionCredentials
   * @returns {*}
   */
  detectAuthHeaderCredentials(request, sessionCredentials = null) {
    let authHeaderValue = null;
    const urlparamname = this.config.get('searchguard.jwt.url_param').toLowerCase();

    // Go through all given query parameters and make them lowercase
    // to avoid confusion when using uppercase or perhaps mixed caps
    const lowerCaseQueryParameters = {};
    if (request.url.query) {
      Object.keys(request.url.query).forEach((query) => {
        lowerCaseQueryParameters[query.toLowerCase()] = request.url.query[query];
      });
    }

    const jwtAuthParam = lowerCaseQueryParameters[urlparamname] || null;

    this.debugLog('JWT from url parameter: ' + jwtAuthParam);

    // The token may be passed via a query parameter
    if (jwtAuthParam != null) {
      authHeaderValue = 'Bearer ' + jwtAuthParam;
    } else if (request.headers[this.authHeaderName]) {
      try {
        authHeaderValue = request.headers[this.authHeaderName];
        this.debugLog('JWT from request header: ' + authHeaderValue);
      } catch (error) {
        this.logger.error(
          'Something went wrong when getting the JWT bearer from the header',
          request.headers
        );
      }
    }

    // If we have sessionCredentials AND auth headers we need to check if they are the same.
    if (
      authHeaderValue !== null &&
      sessionCredentials !== null &&
      sessionCredentials.authHeaderValue === authHeaderValue
    ) {
      // The auth header credentials are the same as those in the session,
      // no need to return new credentials so we're just nulling the token here
      return null;
    }

    if (authHeaderValue !== null) {
      return {
        authHeaderValue: authHeaderValue,
      };
    }

    return authHeaderValue;
  }

  async authenticate(credentials, options, additionalAuthHeaders = {}) {
    // A "login" can happen when we have a token (as header or as URL parameter but no session,
    // or when we have an existing session, but the passed token does not match what's in the session.
    try {
      this.debugLog('Authenticating using ' + credentials.authHeaderValue);
      const user = await this.searchGuardBackend.authenticateWithHeader(
        this.authHeaderName,
        credentials.authHeaderValue,
        additionalAuthHeaders
      );
      let tokenPayload = {};
      try {
        tokenPayload = JSON.parse(
          Buffer.from(credentials.authHeaderValue.split('.')[1], 'base64').toString()
        );
      } catch (error) {
        // Something went wrong while parsing the payload, but the user was authenticated correctly.
      }

      const session = {
        username: user.username,
        credentials: credentials,
        authType: this.type,
      };

      if (tokenPayload.exp) {
        // The token's exp value trumps the config setting
        this.sessionKeepAlive = false;
        session.exp = parseInt(tokenPayload.exp, 10);
        this.debugLog('Setting token .exp: ' + session.exp);
      } else if (this.sessionTTL) {
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
    let url = new URL(request.url.href, 'http://abc');
    url.pathname = path.posix.join(this.basePath, '/customerror');

    // Missing tenant or role takes precedence
    if (error instanceof MissingTenantError) {
      url.searchParams.set('type', 'missingTenant');
    } else if (error instanceof MissingRoleError) {
      url.searchParams.set('type', 'missingRole');
    } else if (error instanceof SessionExpiredError) {
      url.searchParams.set('type', 'sessionExpired');
    } else {
      // The customer may use a login endpoint, to which we can redirect
      // if the user isn't authenticated.
      const loginEndpoint = this.config.get('searchguard.jwt.login_endpoint');
      if (loginEndpoint) {
        try {
          // Parse the login endpoint so that we can append our nextUrl
          // if the customer has defined query parameters in the endpoint
          url = new URL(loginEndpoint);

          // Make sure we don't overwrite an existing "nextUrl" parameter,
          // just in case the customer is using that name for something else
          // Also, we don't want the nextUrl if this is an AJAX request.
          if (!isAJAX && !url.searchParams.has('nextUrl')) {
            url.searchParams.set('nextUrl', this.getNextUrl(request));
            // Delete sg_tenant because we have it already as a param in the nextUrl
            url.searchParams.delete('sg_tenant');
          }

          return url.toString();
        } catch (error) {
          this.logger.error(
            'An error occured while parsing the searchguard.jwt.login_endpoint value'
          );
        }
      }
    }

    return url.pathname + url.search + url.hash;
  }

  onUnAuthenticated(request, response, toolkit, error = null) {
    const redirectTo = this.getRedirectTargetForUnauthenticated(request, error);

    return response.redirected({
      headers: { location: redirectTo },
    });
  }

  setupRoutes() {
    require('./routes')({
      authInstance: this,
      kibanaCore: this.kibanaCore,
      logger: this.logger,
    });
  }
}
