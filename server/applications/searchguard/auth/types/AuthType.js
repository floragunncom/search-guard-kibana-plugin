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
import path from 'path';

export default class AuthType {
  constructor({
    searchGuardBackend,
    kibanaCore,
    config,
    logger,
    sessionStorageFactory,
    pluginDependencies,
  }) {
    this.searchGuardBackend = searchGuardBackend;
    this.config = config;
    this.kibanaCore = kibanaCore;
    this.logger = logger;
    this.sessionStorageFactory = sessionStorageFactory;
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
      '/bootstrap.js',
      '/bundles/app/core/bootstrap.js',
      '/bundles/app/searchguard-customerror/bootstrap.js',
      '/api/core/capabilities',
    ];

    this.sessionTTL = this.config.get('searchguard.session.ttl');
    this.sessionKeepAlive = this.config.get('searchguard.session.keepalive');

    /**
     * The authType is saved in the auth cookie for later reference
     * @type {string}
     */
    this.type = null;

    /**
     * If a loginURL is defined, we can skip the auth selector page
     * if the customer only has one auth type enabled.
     * // @todo This will probably need to change - we may e.g. have multiple OIDC configurations
     * @type {string|null}
     */
    this.loginURL = null;

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
    this.setupRoutes();
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

  authenticate() {
    throw new Error('The authenticate method must be implemented by the sub class');
  }

  onUnAuthenticated() {
    throw new Error('The onUnAuthenticated method must be implemented by the sub class');
  }

  getRedirectTargetForUnauthenticated() {
    throw new Error(
      'The getRedirectTargetForUnauthenticated method must be implemented by the sub class'
    );
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
    let nextUrl = path.posix.join(this.basePath, request.url.pathname);
    if (request.url.search) nextUrl += request.url.search;

    return nextUrl;
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
            sg_redirectTo: this.getRedirectTargetForUnauthenticated(request, error, true),
          },
          body: { message: 'Session expired' },
        });
      }
    }
    return this.onUnAuthenticated(request, response, toolkit, error);
  };

  async getCookieWithCredentials(request) {
    let sessionCookie = (await this.sessionStorageFactory.asScoped(request).get()) || {};
    // @todo Maybe check the headers before the cookie. Since we check the headers
    // in the cookie validation and if headers are present, we overwrite the cookie
    // with the header value. Hence, the end result would be the same, but with less code.

    if (sessionCookie.credentials) {
      try {
        sessionCookie = await this.validateSessionCookie(request, sessionCookie);
      } catch (error) {
        // We can return early here. Even if we have valid request headers,
        // the cookie would have been updated in the validator.
        // Logging this as info since it isn't really an error, but just a part of the flow.
        this.logger.info(`Got auth header credentials, but authentication failed: ${error.stack}`);
        throw error;
      }
    } else {
      // No (valid) cookie, we need to check for headers
      /* @todo Clean this up. Not needed anymore at this point (session based auth)
      // @todo If we DO need to use it, e.g. for JWT, then watch out with
      // kibana_config - the place where we set hasAuthCookie.
      // hasAuthCookie should only be true if we have cookie credentials
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
          throw error;
        }
      }

       */
    }

    return sessionCookie;
  }

  checkAuth = async (request, response, toolkit) => {
    let sessionCookie = (await this.sessionStorageFactory.asScoped(request).get()) || {};

    // Skip auth if we have an authorization header
    if (request.headers[this.authHeaderName]) {

      // @todo START HERE IN THE MORNING - DEBUG IF THE AWAIT DOES

      if (sessionCookie.credentials) {
        // In case we already had a session BEFORE we encountered a request
        // with auth headers, we may need to clear the cookie.
        // This is a bit tricky since we do add an authorization header in the pre auth lifecycle handlers,
        // in which case the cookie should stay.
        // Hence, we compare what we have in the cookie with what's in the header.
        // If the values are different, we need to clear the cookie
        const differentAuthHeaderCredentials = this.detectAuthHeaderCredentials(
          request,
          sessionCookie.credentials
        );

        if (differentAuthHeaderCredentials) {
          // Make sure to clear any auth related cookie info if we detect a different header
          // @todo Multiple auth type support may require an explicit logout
          await this.clear(request);
          // @todo It may make sense to reload the browser at this point - we may have a new user.
          // @todo That would only apply to ajax requests, though.
        }
      }


      return toolkit.authenticated({
        requestHeaders: request.headers,
      });
    }

    if (this.routesToIgnore.includes(request.url.pathname)) {
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

    try {
      sessionCookie = await this.getCookieWithCredentials(request);
    } catch (error) {
      return this._handleUnAuthenticated(request, response, toolkit, error);
    }

    if (sessionCookie.credentials) {
      const authHeaders = await this.getAllAuthHeaders(request, sessionCookie);
      if (!authHeaders && !sessionCookie.isAnonymousAuth) {
        this.logger.error(
          `An error occurred while computing auth headers, clearing session: No headers found in the session cookie`
        );
        await this.clear(request);
        return this._handleUnAuthenticated(request, response, toolkit);
      }

      return toolkit.authenticated({
        requestHeaders: authHeaders,
      });
    }

    return this._handleUnAuthenticated(request, response, toolkit);
  };

  /**
   * If a session auth cookie exists, the sessionValidator is called to validate the content.
   * If the cookie isn't valid, an error will be thrown
   * @param server
   * @returns {validate}
   */
  async validateSessionCookie(request, sessionCookie) {
    if (sessionCookie.authType !== this.type) {
      await this.clear(request);
      throw new InvalidSessionError('Invalid cookie');
    }

    // @todo Checking auth headers will probably go away
    // Check if we have auth header credentials set that are different from the cookie credentials
    /*
    const differentAuthHeaderCredentials = this.detectAuthHeaderCredentials(
      request,
      sessionCookie.credentials
    );
    if (differentAuthHeaderCredentials) {
      try {
        this.debugLog('Authenticated, but found different auth headers. Trying to re-authenticate');
        const authResponse = await this.handleAuthenticate(request, differentAuthHeaderCredentials);
        return authResponse.session;
      } catch (error) {
        this.debugLog(
          'Authenticated, but found different auth headers and re-authentication failed. Clearing cookies.'
        );
        await this.clear(request); // The validator should handle this for us really
        throw error;
      }
    }

     */



    //@todo Additional auth headers will most likely go away
    // Make sure we don't have any conflicting auth headers
    if (!this.validateAdditionalAuthHeaders(request, sessionCookie)) {
      this.debugLog('Validation of different auth headers failed. Clearing cookies.');
      await this.clear(request);
      throw new InvalidSessionError('Validation of different auth headers failed');
    }


    // @todo Checking TTL/expiry will probably move to the backend
    // @todo We still need to handle an expired token though

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

    return sessionCookie;
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

  /**
   * Get all auth headers based on the current request.
   *
   * @param request
   * @param sessionCookie
   * @returns {Promise<boolean|*>}
   */
  async getAllAuthHeaders(request, sessionCookie = null) {
    if (!sessionCookie) {
      try {
        sessionCookie = await this.getCookieWithCredentials(request);
      } catch (error) {
        this.logger.info(`Getting all auth headers failed: ${error.stack}`);
      }
    }

    if (!sessionCookie || !sessionCookie.credentials) {
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
        if (session.additionalAuthHeaders.hasOwnProperty(header)) {
          authHeader[header] = session.additionalAuthHeaders[header];
        }
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

  async handleAuthenticateWithHeaders(request, credentials = {}) {
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
  async _handleAuthResponse(request, credentials, authResponse, additionalAuthHeaders = {}) {
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
    const userHasARole = Array.isArray(authResponse.user.roles) && !!authResponse.user.roles.length;
    if (!userHasARole) {
      throw new MissingRoleError(
        'No roles available for this user, please contact your system administrator.'
      );
    }

    // If we used any additional auth headers when authenticating, we need to store them in the session
    authResponse.session.additionalAuthHeaders = null;
    if (Object.keys(additionalAuthHeaders).length) {
      authResponse.session.additionalAuthHeaders = additionalAuthHeaders;
    }

    const cookie = (await this.sessionStorageFactory.asScoped(request).get()) || {};
    authResponse.session = { ...cookie, ...authResponse.session };

    this.sessionStorageFactory.asScoped(request).set(authResponse.session);

    return authResponse;
  }

  async logout({ context = null, request, response }) {
    await this.clear(request, true);
    return response.ok({
      body: {
        authType: this.type,
        redirectURL: this.basePath + '/login?type=' + this.type + 'Logout',
      },
    });
  }

  /**
   * Remove the credentials from the session cookie
   */
  async clear(request, explicitlyRemoveAuthType = false) {
    const sessionCookie = (await this.sessionStorageFactory.asScoped(request).get()) || {};
    // @todo Consider refactoring anything auth related into an "auth" property.
    delete sessionCookie.credentials;
    delete sessionCookie.username;
    if (explicitlyRemoveAuthType) {
      delete sessionCookie.authType;
    }
    delete sessionCookie.additionalAuthHeaders;
    delete sessionCookie.isAnonymousAuth;

    return await this.sessionStorageFactory.asScoped(request).set(sessionCookie);
  }
}
