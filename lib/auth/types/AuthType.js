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

import InvalidSessionError from '../errors/invalid_session_error';
import SessionExpiredError from '../errors/session_expired_error';
import filterAuthHeaders from '../filter_auth_headers';
import MissingTenantError from '../errors/missing_tenant_error';
import MissingRoleError from '../errors/missing_role_error';
import {
  handleSelectedTenant,
  handleDefaultSpace,
} from '../../../server/applications/multitenancy/request_headers';

export default class AuthType {
  constructor({
    searchGuardBackend,
    kibanaCore,
    config,
    logger,
    sessionStorageFactory,
    elasticsearch,
    pluginDependencies,
  }) {
    this.searchGuardBackend = searchGuardBackend;
    this.config = config;
    this.kibanaCore = kibanaCore;
    this.logger = logger;
    this.sessionStorageFactory = sessionStorageFactory;
    this.elasticsearch = elasticsearch;
    this.pluginDependencies = pluginDependencies;

    this.basePath = kibanaCore.http.basePath.get();
    this.unauthenticatedRoutes = this.config.get('searchguard.auth.unauthenticated_routes');

    this.authDebugEnabled = this.config.get('searchguard.auth.debug');

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

    this.sessionTTL = this.config.get('searchguard.session.ttl');
    this.sessionKeepAlive = this.config.get('searchguard.session.keepalive');

    this.unauthenticatedRoutes.push('/api/v1/systeminfo');

    /**
     * The authType is saved in the auth cookie for later reference
     * @type {string}
     */
    this.type = null;

    /**
     * Tells the sessionPlugin whether or not to validate the number of tenants when authenticating
     * @type {boolean}
     */
    this.validateAvailableTenants = true;

    /**
     * The name of the header were we look for an authorization value.
     * This should most likely be set in the subclass depending on a config value.
     * @type {string}
     */
    this.authHeaderName = 'authorization';

    /**
     * Additional headers that should be passed as part as the authentication.
     * Do not use headers here that have an effect on which user is logged in.
     * @type {string[]}
     */
    this.allowedAdditionalAuthHeaders = ['sg_impersonate_as'];
  }

  async init() {
    // Setting up routes before the auth scheme, mainly for the case where something goes wrong
    // when OpenId tries to get the connect_url
    await this.setupRoutes();
  }

  /**
   * Returns the auth header needed for the Search Guard backend
   * @param session
   * @returns {*}
   */
  getAuthHeader(session) {
    if (session.credentials && session.credentials.authHeaderValue) {
      return {
        [this.authHeaderName]: session.credentials.authHeaderValue,
      };
    }

    return false;
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

      // If we have sessionCredentials AND auth headers we need to check if they are the same.
      if (sessionCredentials !== null && sessionCredentials.authHeaderValue === authHeaderValue) {
        // The auth header credentials are the same as those in the session,
        // no need to return new credentials so we're just nulling the token here
        return null;
      }

      return {
        authHeaderValue: authHeaderValue,
      };
    }

    return null;
  }

  authenticate(credentials, options = {}, additionalAuthHeaders = {}) {
    throw new Error('The authenticate method must be implemented by the sub class');
  }

  onUnAuthenticated(request, response, toolkit, error = null) {
    throw new Error('The onUnAuthenticated method must be implemented by the sub class');
  }

  /**
   * A helper for generating the correct nextUrl.
   * Spaces manipulates the URL for non default
   * spaces, and that change is not reflected
   * in request.url.path
   * @param request
   * @returns {string}
   */
  getNextUrl(request) {
    return encodeURIComponent(this.basePath + request.url.path);
  }

  setupRoutes() {
    throw new Error('The getAuthHeader method must be implemented by the sub class');
  }

  /**
   * Called internally and checks for an AJAX request before
   * invoking the auth type's OnUnAuthenticated method.
   * @param request
   * @param response
   * @param toolkit
   * @param error
   * @returns {Promise<void|*>}
   * @private
   */
  _handleUnAuthenticated = async (request, response, toolkit, error = null) => {
    if (request.headers) {
      // If the session has expired, we may receive ajax requests that can't handle a 302 redirect.
      // In this case, we trigger a 401 and let the interceptor handle the redirect on the client side.
      if (
        (request.headers.accept &&
          request.headers.accept.split(',').indexOf('application/json') > -1) ||
        (request.headers['content-type'] &&
          request.headers['content-type'].indexOf('application/json') > -1)
      ) {
        this.debugLog('Not authenticated, detected AJAX request');

        return response.unauthorized({
          headers: {
            redirectTo: 'login',
          },
          body: { message: 'Session expired' },
        });
      }
    }
    return this.onUnAuthenticated(request, response, toolkit, error);
  };

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

    let sessionCookie = (await this.sessionStorageFactory.asScoped(request).get()) || {};
    // @todo Maybe check the headers before the cookie. Since we check the headers
    // in the cookie validation and if headers are present, we overwrite the cookie
    // with the header value. Hence, the end result would be the same, but with less code.

    if (sessionCookie.credentials) {
      try {
        const validationResult = await this.validateSessionCookie(request, sessionCookie);
        // @todo This is a weird construct - sessionValidationConstruct.credentials actually contains the entire cookie content. Leftover from hapi auth cookie
        sessionCookie = validationResult.credentials;
      } catch (error) {
        // We can return early here. Even if we have valid request headers,
        // the cookie would have been updated in the validator.
        this.logger.info(`Found cookie, but cookie validation failed`);
        return this._handleUnAuthenticated(request, response, toolkit, error);
      }
    } else {
      // No (valid) cookie, we need to check for headers
      const authHeaderCredentials = this.detectAuthHeaderCredentials(request);
      if (authHeaderCredentials) {
        try {
          this.debugLog('Got auth header credentials, trying to authenticate');
          this.debugLog({ authHeaderCredentials });
          const { session } = await this.handleAuthenticate(request, authHeaderCredentials);
          sessionCookie = session;
        } catch (error) {
          this.logger.error(
            `Got auth header credentials, but authentication failed: ${error.stack}`
          );
          return this._handleUnAuthenticated(request, response, toolkit, error);
        }
      }
    }

    if (sessionCookie.credentials) {
      const authHeaders = await this.getAllAuthHeaders(request, sessionCookie);
      if (!authHeaders) {
        this.logger.error(
          `An error occurred while computing auth headers, clearing session: No headers found in the session cookie`
        );
        await this.clear(request);
        return this._handleUnAuthenticated(request, response, toolkit);
      }

      let selectedTenant = null;

      if (this.config.get('searchguard.multitenancy.enabled')) {
        selectedTenant = await handleSelectedTenant({
          authHeaders,
          sessionCookie,
          searchGuardBackend: this.searchGuardBackend,
          config: this.config,
          sessionStorageFactory: this.sessionStorageFactory,
          logger: this.logger,
          request,
        });

        await handleDefaultSpace({
          request,
          authHeaders,
          selectedTenant,
          pluginDependencies: this.pluginDependencies,
          logger: this.logger,
          searchGuardBackend: this.searchGuardBackend,
          elasticsearch: this.elasticsearch,
        });
      }

      if (selectedTenant) {
        authHeaders.sgtenant = selectedTenant;
      }

      return toolkit.authenticated({
        requestHeaders: authHeaders,
      });
    }

    return this._handleUnAuthenticated(request, response, toolkit);
  };

  /**
   * If a session auth cookie exists, the sessionValidator is called to validate the content
   * @param server
   * @returns {validate}
   */
  async validateSessionCookie(request, sessionCookie) {
    if (sessionCookie.authType !== this.type) {
      await this.clear(request);
      throw new InvalidSessionError('Invalid cookie');
    }

    // Check if we have auth header credentials set that are different from the cookie credentials
    const differentAuthHeaderCredentials = this.detectAuthHeaderCredentials(
      request,
      sessionCookie.credentials
    );
    if (differentAuthHeaderCredentials) {
      try {
        this.debugLog('Authenticated, but found different auth headers. Trying to re-authenticate');
        const authResponse = await this.handleAuthenticate(request, differentAuthHeaderCredentials);
        return { valid: true, credentials: authResponse.session };
      } catch (error) {
        this.debugLog(
          'Authenticated, but found different auth headers and re-authentication failed. Clearing cookies.'
        );
        await this.clear(request); // The validator should handle this for us really
        throw error;
      }
    }

    // Make sure we don't have any conflicting auth headers
    if (!this.validateAdditionalAuthHeaders(request, sessionCookie)) {
      this.debugLog('Validation of different auth headers failed. Clearing cookies.');
      await this.clear(request);
      throw new InvalidSessionError('Validation of different auth headers failed');
    }

    // If we are still here, we need to compare the expiration time
    // JWT's .exp is denoted in seconds, not milliseconds.
    if (sessionCookie.exp && sessionCookie.exp < Math.floor(Date.now() / 1000)) {
      this.debugLog('Session expired - .exp is in the past. Clearing cookies');
      await this.clear(request);
      throw new SessionExpiredError('Session expired');
    } else if (!sessionCookie.exp && this.sessionTTL) {
      if (!sessionCookie.expiryTime || sessionCookie.expiryTime < Date.now()) {
        this.debugLog(
          'Session expired - the credentials .expiryTime is in the past. Clearing cookies.'
        );
        await this.clear(request);
        throw new SessionExpiredError('Session expired');
      }

      if (this.sessionKeepAlive) {
        sessionCookie.expiryTime = Date.now() + this.sessionTTL;
        // According to the documentation, returning the cookie in the cookie
        // should be equivalent to calling request.auth.cookie.set(),
        // but it seems like the cookie's browser lifetime isn't updated.
        // Hence, we need to set it explicitly.
        this.sessionStorageFactory.asScoped(request).set(sessionCookie);
      }
    }

    return { valid: true, credentials: sessionCookie };
  }

  /**
   * Validates
   * @param request
   * @param session
   * @returns {boolean}
   */
  validateAdditionalAuthHeaders(request, session) {
    // Check if the request has any of the headers that can be used on authentication
    const authHeadersInRequest = filterAuthHeaders(
      request.headers,
      this.allowedAdditionalAuthHeaders
    );

    if (Object.keys(authHeadersInRequest).length === 0) {
      return true;
    }

    // If we have applicable headers in the request, but not in the session, the validation fails
    if (!session.additionalAuthHeaders) {
      this.debugLog(
        'Additional auth header validation failed - headers found are not in the session.'
      );
      return false;
    }

    // If the request has a conflicting auth header we log out the user
    for (const header in session.additionalAuthHeaders) {
      if (session.additionalAuthHeaders[header] !== authHeadersInRequest[header]) {
        this.debugLog(
          'Validation of different auth headers failed due to conflicting header values'
        );
        return false;
      }
    }

    return true;
  }

  async getAllAuthHeaders(request, sessionCookie = null) {
    if (!sessionCookie) {
      sessionCookie = await this.sessionStorageFactory.asScoped(request).get();
    }

    if (!sessionCookie) {
      return false;
    }

    const authHeader = this.getAuthHeader(sessionCookie);
    if (authHeader !== false) {
      this.addAdditionalAuthHeaders(request, authHeader, sessionCookie);

      return authHeader;
    }

    return false;
  }

  /**
   * Method for adding additional auth type specific authentication headers.
   * Override this in the auth type for type specific headers.
   *
   * NB: Remember to call the super method if you do.
   *
   * @param request
   * @param authHeader
   * @param session
   */
  addAdditionalAuthHeaders(request, authHeader, session) {
    if (session.additionalAuthHeaders) {
      for (const header in session.additionalAuthHeaders) {
        authHeader[header] = session.additionalAuthHeaders[header];
      }
    }
  }

  debugLog(message, label = '') {
    if (this.authDebugEnabled) {
      try {
        if (typeof message !== 'string') {
          // @todo It seems like the logger should support passing
          // an arbitrary object, but the object is never shown...
          message = JSON.stringify(message);
        }
        this.logger.info(`${label} ${message}`);
      } catch (error) {
        this.logger.error(`Error in debug log: ${error.stack}`);
      }
    }
  }

  /**
   * Tries to authenticate a user. If multitenancy is enabled, we also try to validate that the
   * user has at least one valid tenant
   * @param {object} request
   * @param {object} headers
   * @param {object} credentials
   * @returns {Promise<*>}
   */
  async handleAuthenticate(request, credentials, options = {}) {
    try {
      const additionalAuthHeaders = filterAuthHeaders(
        request.headers,
        this.allowedAdditionalAuthHeaders
      );
      // authResponse is an object with .session and .user
      const authResponse = await this.authenticate(credentials, options, additionalAuthHeaders);

      return this._handleAuthResponse(request, credentials, authResponse, additionalAuthHeaders);
    } catch (error) {
      // Make sure we clear any existing cookies if something went wrong
      this.clear(request);
      throw error;
    }
  }

  async handleAuthenticateWithHeaders(request, credentials = {}, options = {}) {
    try {
      const additionalAuthHeaders = filterAuthHeaders(
        request.headers,
        this.allowedAdditionalAuthHeaders
      );
      const user = await this.searchGuardBackend.authenticateWithHeaders(
        request.headers,
        credentials,
        additionalAuthHeaders
      );
      const session = {
        username: user.username,
        credentials: credentials,
        authType: this.type,
        /**
         * Used later to signal that we should not assign any specific auth header in AuthType
         */
        assignAuthHeader: false,
      };

      // @todo Why is this only set here, but not in handleAuthenticate? This should be done by the session validation?
      const sessionTTL = this.config.get('searchguard.session.ttl');

      if (sessionTTL) {
        session.expiryTime = Date.now() + sessionTTL;
      }

      const authResponse = {
        session,
        user,
      };

      return this._handleAuthResponse(request, credentials, authResponse, additionalAuthHeaders);
    } catch (error) {
      // Make sure we clear any existing cookies if something went wrong
      this.clear(request);
      throw error;
    }
  }

  /**
   * Normalized response after an authentication
   * @param credentials
   * @param authResponse
   * @returns {*}
   * @private
   */
  _handleAuthResponse(request, credentials, authResponse, additionalAuthHeaders = {}) {
    // Make sure the user has a tenant that they can use
    if (
      this.validateAvailableTenants &&
      this.config.get('searchguard.multitenancy.enabled') &&
      !this.config.get('searchguard.multitenancy.tenants.enable_global')
    ) {
      const privateTenantEnabled = this.config.get(
        'searchguard.multitenancy.tenants.enable_private'
      );

      const allTenants = authResponse.user.tenants;
      if (allTenants != null && !privateTenantEnabled) {
        delete allTenants[authResponse.user.username];
      }

      if (allTenants == null || Object.keys(allTenants).length === 0) {
        throw new MissingTenantError(
          'No tenant available for this user, please contact your system administrator.'
        );
      }
    }

    // Validate that the user has at least one valid role
    if (
      this.validateAvailableRoles &&
      (!authResponse.user.roles || authResponse.user.roles.length === 0)
    ) {
      throw new MissingRoleError(
        'No roles available for this user, please contact your system administrator.'
      );
    }

    // If we used any additional auth headers when authenticating, we need to store them in the session
    authResponse.session.additionalAuthHeaders = null;
    if (Object.keys(additionalAuthHeaders).length) {
      authResponse.session.additionalAuthHeaders = additionalAuthHeaders;
    }

    this.sessionStorageFactory.asScoped(request).set(authResponse.session);

    return authResponse;
  }

  /**
   * Remove the credentials from the session cookie
   */
  async clear(request) {
    const sessionCookie = (await this.sessionStorageFactory.asScoped(request).get()) || {};
    delete sessionCookie.credentials;
    return await this.sessionStorageFactory.asScoped(request).set(sessionCookie);
  }
}
