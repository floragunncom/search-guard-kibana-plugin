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
import { parseLoginEndpoint } from './parse_login_endpoint';

export default class ProxyCache extends AuthType {
  constructor(searchGuardBackend, server, APP_ROOT, API_ROOT, kibanaCore, config) {
    super(searchGuardBackend, server, APP_ROOT, API_ROOT, kibanaCore, config);

    /**
     * The authType is saved in the auth cookie for later reference
     * @type {string}
     */
    this.type = 'proxycache';

    /**
     * The header that identifies the user
     */
    this.userHeaderName = this.config.get('searchguard.proxycache.user_header').toLowerCase();

    /**
     * The header that identifies the user's role(s). Optional.
     */
    this.rolesHeaderName = this.config.get('searchguard.proxycache.roles_header').toLowerCase();
  }

  debugLog(message, label = 'proxycache') {
    super.debugLog(message, label);
  }

  /**
   * Detect authorization header value, either as an http header or as a query parameter
   * @param request
   * @param sessionCredentials
   * @returns {*}
   */
  detectAuthHeaderCredentials(request, sessionCredentials = null) {
    // The point of ProxyCache is that we only have headers on the first request.
    // In other words, if we already have a session, we don't need to check the headers.
    if (sessionCredentials !== null) {
      return null;
    }

    if (request.headers[this.userHeaderName]) {
      const authHeaderValues = {
        [this.userHeaderName]: request.headers[this.userHeaderName],
        'x-forwarded-for': request.headers['x-forwarded-for'],
      };

      // The roles header is optional
      if (request.headers[this.rolesHeaderName]) {
        authHeaderValues[this.rolesHeaderName] = request.headers[this.rolesHeaderName];
      }

      this.debugLog({ authHeaderValues });
      return authHeaderValues;
    } else if (request.headers[this.authHeaderName]) {
      return {
        [this.authHeaderName]: request.headers[this.authHeaderName],
      };
    }

    // We still need to support basic auth for Curl etc.
    return null;
  }

  /**
   * Returns the auth header(s) needed for the Search Guard backend
   * @param session
   * @returns {*}
   */
  getAuthHeader(session) {
    if (!session.credentials) {
      return false;
    }

    if (session.credentials[this.userHeaderName]) {
      return {
        [this.userHeaderName]: session.credentials[this.userHeaderName],
        [this.rolesHeaderName]: session.credentials[this.rolesHeaderName],
      };
    } else if (session.credentials[this.authHeaderName]) {
      return {
        [this.authHeaderName]: session.credentials[this.authHeaderName],
      };
    }

    return false;
  }

  async authenticate(credentialHeaders, options = {}, additionalAuthHeaders = {}) {
    try {
      this.debugLog({
        credentialHeaders,
        additionalAuthHeaders
      });

      const user = await this.searchGuardBackend.authenticateWithHeaders(
        credentialHeaders,
        credentialHeaders,
        additionalAuthHeaders
      );

      const session = {
        username: user.username,
        credentials: credentialHeaders,
        authType: this.type,
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

  onUnAuthenticated(request, h, error) {
    if (error instanceof MissingTenantError) {
      return h.redirect(this.basePath + '/customerror?type=missingTenant');
    } else if (error instanceof MissingRoleError) {
      return h.redirect(this.basePath + '/customerror?type=missingRole');
    } else {
      // The customer may use a login endpoint, to which we can redirect
      // if the user isn't authenticated.
      const loginEndpoint = this.config.get('searchguard.proxycache.login_endpoint');
      if (loginEndpoint) {
        try {
          const redirectUrl = parseLoginEndpoint(loginEndpoint, request);
          return h.redirect(redirectUrl);
        } catch (error) {
          // @todo Replace with new log
          this.server.log(
            ['error', 'searchguard'],
            'An error occured while parsing the searchguard.proxycache.login_endpoint value'
          );
          return h.redirect(this.basePath + '/customerror?type=proxycacheAuthError');
        }
      } else if (error instanceof SessionExpiredError) {
        return h.redirect(this.basePath + '/customerror?type=sessionExpired');
      } else {
        return h.redirect(this.basePath + '/customerror?type=proxycacheAuthError');
      }
    }
  }

  setupRoutes() {
    require('./routes')(
      this.searchGuardBackend,
      this.server,
      this.APP_ROOT,
      this.API_ROOT,
      this.kibanaCore,
      this.config
    );
  }

  addAdditionalAuthHeaders(request, authHeader, session) {
    super.addAdditionalAuthHeaders(request, authHeader, session);

    // for proxy cache mode, make it possible to assign the proxy ip,
    // usually as x-forwarded-for header. Only if no headers are already present
    const existingProxyHeaders =
      request.headers[this.config.get('searchguard.proxycache.proxy_header')];
    // do not overwrite existing headers from existing proxy
    if (existingProxyHeaders) {
      return;
    }

    const remoteIP = request.info.remoteAddress;
    const proxyIP = this.config.get('searchguard.proxycache.proxy_header_ip');
    authHeader[this.config.get('searchguard.proxycache.proxy_header')] = remoteIP + ',' + proxyIP;
    try {
      this.debugLog('Additional auth header: ' + this.config.get('searchguard.proxycache.proxy_header') + ' ' + remoteIP + ',' + proxyIP)
    } catch (error) {
      // Ignore
    }
  }
}
