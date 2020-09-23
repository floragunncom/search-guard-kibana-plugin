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

import { assign } from 'lodash';
import InvalidSessionError from '../errors/invalid_session_error';
import SessionExpiredError from '../errors/session_expired_error';
import filterAuthHeaders from '../filter_auth_headers';
import MissingTenantError from '../errors/missing_tenant_error';
import MissingRoleError from '../errors/missing_role_error';

export default class AuthType {
  constructor(
    searchGuardBackend,
    server,
    APP_ROOT,
    API_ROOT,
    kibanaCore,
    config,
    logger,
    sessionStorageFactory
  ) {
    this.searchGuardBackend = searchGuardBackend;
    this.server = server;
    this.APP_ROOT = APP_ROOT;
    this.API_ROOT = API_ROOT;
    this.config = config;
    this.kibanaCore = kibanaCore;
    this.logger = logger;
    this.sessionStorageFactory = sessionStorageFactory;

    console.log('***** Initing what is factory', sessionStorageFactory);

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

    /**
     * @todo This was introduced with Kibana 6.6. Can we remove that bug now after migrating to registerAuth?
     * This is a workaround for keeping track of what caused hapi-auth-cookie's validateFunc to fail.
     * There seems to be an issue with how the plugin checks the thrown error and instead of passing
     * it on, it throws its own error.
     *
     * @type {null}
     * @private
     */
    this._cookieValidationError;
  }

  async init() {
    // Setting up routes before the auth scheme, mainly for the case where something goes wrong
    // when OpenId tries to get the connect_url
    await this.setupRoutes();
  }

  getCookieConfig() {
    const cookieConfig = {
      encryptionKey: this.config.get('searchguard.cookie.password'),
      name: this.config.get('searchguard.cookie.name'),
      isSecure: this.config.get('searchguard.cookie.secure'),
      //validateFunc: this.sessionValidator(this.server),
      validate: () => {
        // @todo Just implement our own validation function again
        return { isValid: true, path: '/' };
      },

      clearInvalid: true,
      ttl: this.config.get('searchguard.cookie.ttl'),
      isSameSite: this.config.get('searchguard.cookie.isSameSite'),
    };

    if (this.config.get('searchguard.cookie.domain')) {
      cookieConfig.domain = this.config.get('searchguard.cookie.domain');
    }

    return cookieConfig;
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

  onUnAuthenticated(request, h) {
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

    const cookie = await this.sessionStorageFactory.asScoped(request).get();
    if (cookie) {
      // @todo We need to take the additionalAuthHeaders into account here
      const authHeaders = this.getAuthHeader(cookie);
      //authHeaders.sgtenant = typeof cookie.tenant !== 'undefined' ? cookie.tenant : '';
      console.log('****** AuthType: What the headers?', authHeaders);
      return toolkit.authenticated({
        requestHeaders: authHeaders,
      });
    }

    // @todo ...we also always check for request headers.
    // Move the existing logic into this function. Should be copy & paste.

    return this.onUnAuthenticated(request, response, toolkit);
  };

  setupAuthScheme() {
    this.server.auth.scheme('sg_access_control_scheme', (server, options) => ({
      authenticate: async (request, h) => {
        let credentials = null;

        if (this.routesToIgnore.includes(request.path)) {
          return h.continue;
        }

        // let configured routes that are not under our control pass,
        // for example /api/status to check Kibana status without a logged in user
        if (this.unauthenticatedRoutes.includes(request.path)) {
          credentials = this.searchGuardBackend.getServerUser();
          return h.authenticated({ credentials });
        }

        try {
          credentials = await this.server.auth.test('sg_access_control_cookie', request);
          return h.authenticated({ credentials });
        } catch (error) {
          if (this._cookieValidationError) {
            const validationError = this._cookieValidationError;
            this._cookieValidationError = null;
            this.debugLog(`Cookie exists, but validation failed. Path: ${request.path}`);
            return this.onUnAuthenticated(request, h, validationError).takeover();
          }

          const authHeaderCredentials = this.detectAuthHeaderCredentials(request);
          if (authHeaderCredentials) {
            try {
              this.debugLog('Got auth header credentials, trying to authenticate');
              this.debugLog({ authHeaderCredentials });
              const { session } = await this.handleAuthenticate(
                request,
                request.headers,
                authHeaderCredentials
              );

              // Returning the session equals setting the values with hapi-auth-cookie@set()
              return h.authenticated({
                // Watch out here - hapi-auth-cookie requires us to send back an object with credentials
                // as a key. Otherwise other values than the credentials will be overwritten
                credentials: session,
              });
            } catch (authError) {
              this.server.log(
                ['searchguard', 'error'],
                `Got auth header credentials, but authentication failed: ${error.stack}`
              );
              return this.onUnAuthenticated(request, h, authError).takeover();
            }
          }

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
              return h
                .response({ message: 'Session expired', redirectTo: 'login' })
                .code(401)
                .takeover();
            }
          }
        }

        return this.onUnAuthenticated(request, h).takeover();
      },
    }));

    this.server.auth.strategy(
      'sg_access_control',
      'sg_access_control_scheme',
      this.getCookieConfig()
    );
    this.server.auth.strategy('sg_access_control_cookie', 'cookie', this.getCookieConfig());
    // Activates hapi-auth-cookie for ALL routes, unless
    // a) the route is listed in "unauthenticatedRoutes" or
    // b) the auth option in the route definition is explicitly set to false

    this.server.auth.default({
      mode: 'required', // @todo Investigate best mode here
      strategy: 'sg_access_control', // This seems to be the only way to apply the strategy to ALL routes, even those defined before we add the strategy.
    });
  }

  /**
   * If a session auth cookie exists, the sessionValidator is called to validate the content
   * @param server
   * @returns {validate}
   */
  sessionValidator(server) {
    const validate = async (request, session) => {
      this._cookieValidationError = null;

      if (session.authType !== this.type) {
        this._cookieValidationError = new InvalidSessionError('Invalid session');

        return { valid: false };
      }

      // Check if we have auth header credentials set that are different from the session credentials
      const differentAuthHeaderCredentials = this.detectAuthHeaderCredentials(
        request,
        session.credentials
      );
      if (differentAuthHeaderCredentials) {
        try {
          this.debugLog(
            'Authenticated, but found different auth headers. Trying to re-authenticate'
          );
          const authResponse = await this.handleAuthenticate(
            request,
            request.headers,
            differentAuthHeaderCredentials
          );
          return { valid: true, credentials: authResponse.session };
        } catch (error) {
          this.debugLog(
            'Authenticated, but found different auth headers and re-authentication failed. Clearing cookies.'
          );
          this.clear(request); // The validator should handle this for us really
          return { valid: false };
        }
      }

      // Make sure we don't have any conflicting auth headers
      if (!this.validateAdditionalAuthHeaders(request, session)) {
        this.debugLog('Validation of different auth headers failed. Clearing cookies.');
        return { valid: false };
      }

      // If we are still here, we need to compare the expiration time
      // JWT's .exp is denoted in seconds, not milliseconds.
      if (session.exp && session.exp < Math.floor(Date.now() / 1000)) {
        this._cookieValidationError = new SessionExpiredError('Session expired');
        this.debugLog('Session expired - .exp is in the past. Clearing cookies');
        this.clear(request);
        return { valid: false };
      } else if (!session.exp && this.sessionTTL) {
        if (!session.expiryTime || session.expiryTime < Date.now()) {
          this.debugLog(
            'Session expired - the credentials .expiryTime is in the past. Clearing cookies.'
          );
          this._cookieValidationError = new SessionExpiredError('Session expired');
          return { valid: false };
        }

        if (this.sessionKeepAlive) {
          session.expiryTime = Date.now() + this.sessionTTL;
          // According to the documentation, returning the session in the cookie
          // should be equivalent to calling request.auth.session.set(),
          // but it seems like the cookie's browser lifetime isn't updated.
          // Hence, we need to set it explicitly.
          // @todo TEST IF THIS HAS BEEN FIXED IN HAPI-AUTH-COOKIE
          //request.cookieAuth.set(session);
          this.sessionStorageFactory.asScoped(request).set(session);
        }
      }

      return { valid: true, credentials: session };
    };

    return validate;
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
   * Add credential headers to the passed request.
   * @param request
   */
  async assignAuthHeader(request) {
    if (!request.headers[this.authHeaderName]) {
      let session = await this.sessionStorageFactory.asScoped(request).get();
      if (session) {
        // @todo This does not belong here - should be in the validation. Delete after test
        const authHeader = this.getAuthHeader(session);
        if (authHeader !== false) {
          this.addAdditionalAuthHeaders(request, authHeader, session);

          return authHeader;
        }
      }

      if (session) {
        const sessionValidator = this.sessionValidator();
        try {
          const sessionValidationResult = await sessionValidator(request, session);
          if (sessionValidationResult.valid) {
            session = sessionValidationResult.credentials;
          } else {
            session = false;
          }
        } catch (error) {
          console.log(error);
          this.server.log(
            ['searchguard', 'error'],
            `An error occurred while computing auth headers, clearing session: ${error}`
          );
        }
      }

      if (session && session.credentials) {
        try {
          const authHeader = this.getAuthHeader(session);
          if (authHeader !== false) {
            this.addAdditionalAuthHeaders(request, authHeader, session);

            return authHeader;
          }
        } catch (error) {
          this.server.log(
            ['searchguard', 'error'],
            `An error occurred while computing auth headers, clearing session: ${error}`
          );
          this.clear(request);
          throw error;
        }
      }
    }
  }

  /**
   * Called on each authenticated request.
   * Used to add the credentials header to the request.
   */
  registerAssignAuthHeader() {
    this.kibanaCore.http.registerOnPreAuth((request, response, toolkit) => {
      try {
        this.assignAuthHeader(request);
      } catch (error) {
        const redirectTo = this.basePath + '/customerror?type=authError';
        return response.redirected({
          headers: {
            location: `${redirectTo}`,
          },
        });
      }

      return toolkit.next();
    });
    /*
    this.server.ext('onPreAuth', (request, h) => {
      try {
        this.assignAuthHeader(request);
      } catch (error) {

        return h.redirect(this.basePath + '/customerror?type=authError');
      }

      return h.continue;
    });

     */
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

  debugLog(message, labels = null) {
    if (this.authDebugEnabled) {
      try {
        let logArguments = ['info', '_searchguard', 'auth'];
        if (labels) {
          if (typeof labels === 'string') {
            labels = [labels];
          }
          logArguments = logArguments.concat(labels);
        }

        this.server.log(logArguments, message);
      } catch (error) {
        this.server.log(['searchguard', 'error'], `Error in debug log: ${error.stack}`);
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
  async handleAuthenticate(request, headers, credentials, options = {}) {
    try {
      const additionalAuthHeaders = filterAuthHeaders(headers, this.allowedAdditionalAuthHeaders);
      // authResponse is an object with .session and .user
      const authResponse = await this.authenticate(credentials, options, additionalAuthHeaders);

      return this._handleAuthResponse(request, credentials, authResponse, additionalAuthHeaders);
    } catch (error) {
      // Make sure we clear any existing cookies if something went wrong
      this.clear(request);
      throw error;
    }
  }

  async handleAuthenticateWithHeaders(request, headers, credentials = {}, options = {}) {
    try {
      const additionalAuthHeaders = filterAuthHeaders(headers, this.allowedAdditionalAuthHeaders);
      const user = await this.searchGuardBackend.authenticateWithHeaders(
        headers,
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
   * Clears the cookies associated with the authenticated user
   */
  clear(request) {
    this.sessionStorageFactory.asScoped(request).clear();
  }
}
