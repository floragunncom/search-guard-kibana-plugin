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

import { KibanaResponse } from '@kbn/core-http-server';
import { ensureRawRequest } from '@kbn/core-http-router-server-internal';

import InvalidSessionError from '../errors/invalid_session_error';
import SessionExpiredError from '../errors/session_expired_error';
import filterAuthHeaders from '../filter_auth_headers';
import MissingTenantError from '../errors/missing_tenant_error';
import path from 'path';
import {GLOBAL_TENANT_NAME} from "../../../../../common/multitenancy";

export default class AuthType {
  constructor({
    searchGuardBackend,
    kibanaCore,
    config,
    logger,
    sessionStorageFactory,
    pluginDependencies,
    spacesService,
  }) {
    this.searchGuardBackend = searchGuardBackend;
    this.config = config;
    this.kibanaCore = kibanaCore;
    this.logger = logger;
    this.sessionStorageFactory = sessionStorageFactory;
    this.pluginDependencies = pluginDependencies;
    this.spacesService = spacesService;

    this.basePath = kibanaCore.http.basePath.get();
    this.frontendBaseUrl =
      this.config.get('searchguard.frontend_base_url') || kibanaCore.http.basePath.publicBaseUrl;
    this.sgFrontendConfigId = this.config.get('searchguard.sg_frontend_config_id') || 'default'; 

    if (!this.frontendBaseUrl) {
      const serverInfo = kibanaCore.http.getServerInfo();
      this.frontendBaseUrl =
        serverInfo.protocol +
        '://' +
        serverInfo.hostname +
        ':' +
        serverInfo.port +
        '/' +
        kibanaCore.http.basePath.serverBasePath;
    }

    this.authDebugEnabled = this.config.get('searchguard.auth.debug');

    /**
     * The authType is saved in the auth cookie for later reference
     * @type {string}
     */
    this.type = null;

    /**
     * If a loginURL is defined, we can skip the auth selector page
     * if the customer only has one auth type enabled.
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
   * Can be used by auth types that need to handle cases
   * where the credentials are passed together with the
   * request.
   * Example: JWT supports passing the bearer token per query parameter
   *
   * NB: Should NOT be used to detect pre-authenticated requests.
   * For those, we don't want to create a cookie.
   *
   * @param request
   * @returns {Promise<null>}
   */
  async detectCredentialsByRequest({ request }) {
    return null;
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
        // no need to return new credentials so we're just returning null here
        return null;
      }

      return {
        authHeaderValue: authHeaderValue,
      };
    }

    return null;
  }

  async getRedirectTargetForUnauthenticated() {
    throw new Error(
      'The getRedirectTargetForUnauthenticated method must be implemented by the sub class'
    );
  }

  async authenticate(credentials, options = {}, additionalAuthHeaders = {}) {
    try {
      this.debugLog('Authenticating using ' + credentials);

	  credentials.frontend_base_url = this.frontendBaseUrl;
      credentials.config_id = this.sgFrontendConfigId;

      const sessionResponse = await this.searchGuardBackend.authenticateWithSession(credentials);

      const sessionCredentials = {
        authHeaderValue: 'Bearer ' + sessionResponse.token,
      };
      this.debugLog('Token ' + sessionCredentials.authHeaderValue);

      const user = await this.searchGuardBackend.authenticateWithHeader(
        this.authHeaderName,
        sessionCredentials.authHeaderValue,
        additionalAuthHeaders
      );

      const session = {
        username: user.username,
        // The session token
        credentials: sessionCredentials,
        authType: this.type,
        authTypeId: credentials.id,
      };

      return {
        session,
        user,
        redirectUri: sessionResponse.redirect_uri,
      };
    } catch (error) {
      throw error;
    }
  }

  async onUnAuthenticated(request, response, toolkit, error = null) {
    const redirectTo = await this.getRedirectTargetForUnauthenticated(request, error);

    return response.redirected({
      headers: {
        location: `${redirectTo}`,
      },
    });
  }

  /**
   * A helper for generating the correct nextUrl.
   * Spaces manipulates the URL for non default
   * spaces, and that change is not reflected
   * in request.url.pathname
   * @param request
   * @returns {string}
   */
  getNextUrl(request) {
    return path.posix.join(this.basePath, request.url.pathname) + request.url.search;
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
    // We don't have valid cookie credentials, but we may have an optional auth
    try {
      if (request.route.options.authRequired === 'optional') {
        return toolkit.next();
      }
    } catch (error) {
      this.logger.info('Could not read auth options for the path: ' + request.url.pathname);
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
        const sessionCookie = (await this.sessionStorageFactory.asScoped(request).get()) || {};

        if (request.route.path === '/api/core/capabilities') {
          return toolkit.notHandled();
        }

        return response.unauthorized({
          headers: {
            sg_redirectTo: await this.getRedirectTargetForUnauthenticated(
              request,
              error,
              true,
              sessionCookie
            ),
          },
          body: { message: 'Session expired' },
        });
      }
    }
    return this.onUnAuthenticated(request, response, toolkit, error);
  };

  async getCookieWithCredentials(request) {
    const authHeaderCredentials = await this.detectCredentialsByRequest({ request });
    if (authHeaderCredentials) {
      try {
        this.debugLog('Got auth header credentials, trying to authenticate');
        const { session } = await this.handleAuthenticate(request, authHeaderCredentials);
        return session;
      } catch (error) {
        this.logger.error(`Got auth header credentials, but authentication failed: ${error.stack}`);
        // Fall through
      }
    } 

    let sessionCookie = (await this.sessionStorageFactory.asScoped(request).get()) || {};

    if (sessionCookie.credentials) {
      try {
        return await this.validateSessionCookie(request, sessionCookie);
      } catch (error) {
        // Logging this as info since it isn't really an error, but just a part of the flow.
        this.logger.info(`Got credentials, but the validation failed: ${error.stack}`);
        throw error;
      }
    }

    // No (valid) cookie, we need to check for headers
    return sessionCookie;
  }

  onPostAuth = async (request, response, toolkit) => {
    if (request.route.path === '/api/core/capabilities') {
      const sessionCookie = (await this.sessionStorageFactory.asScoped(request).get()) || {};
      if (sessionCookie.isAnonymousAuth) return toolkit.next();

      const authHeaders = await this.getAllAuthHeaders(request);
      if (authHeaders === false) {
        /*
        We need this redirect because Kibana calls the capabilities on our login page. The Kibana checks if there is the default space in the Kibana index.
        The problem is that the Kibana call is scoped to the current request. And the current request doesn't contain any credentials in the headers because the user hasn't been authenticated yet.
        As a result, the call fails with 401, and the user sees the Kibana error page instead of our login page.
        We flank this issue by redirecting the Kibana call to our route /api/v1/searchguard/kibana_capabilities where we serve some
        minimum amount of capabilities. We expect that Kibana fetches the capabilities again once the user logged in.
        */
        // The payload is passed together with the redirect despite of the undefined here
        return new KibanaResponse(307, undefined, {
          headers: { location: this.basePath + '/api/v1/searchguard/kibana_capabilities' },
        });
      } else {
        // Update the request with auth headers in order to allow Kibana to check the default space.
        // Kibana page breaks if Kibana can't check the default space.
        const rawRequest = ensureRawRequest(request);
        assign(rawRequest.headers, authHeaders);
      }
    }

    return toolkit.next();
  };

  checkAuth = async (request, response, toolkit) => {
    let sessionCookie = (await this.sessionStorageFactory.asScoped(request).get()) || {};

    try {
      sessionCookie = await this.getCookieWithCredentials(request);
    } catch (error) {
      return this._handleUnAuthenticated(request, response, toolkit, error);
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

      const isMtEnabled = this.config.get('searchguard.multitenancy.enabled');
      if (!isMtEnabled && this.pluginDependencies.spaces) {
        await this.spacesService.createDefaultSpace({ request: { headers: authHeaders } });
      }

      const rawRequest = ensureRawRequest(request);
      assign(rawRequest.headers, authHeaders);
      return toolkit.next();
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

    const checkTokenExpirationTime = Date.now();
    if (
      !sessionCookie.checkTokenExpirationTime ||
      checkTokenExpirationTime - sessionCookie.checkTokenExpirationTime > 15000
    ) {
      try {
        const authHeader = this.getAuthHeader(sessionCookie);
        const authInfoResponse = await this.searchGuardBackend.authinfo(
          authHeader || request.headers
        );
        sessionCookie.checkTokenExpirationTime = checkTokenExpirationTime;
        await this.sessionStorageFactory.asScoped(request).set(sessionCookie);
        if (authInfoResponse.user_name !== sessionCookie.username) {
          throw new Error(
            'We have a different user in the cookie. Most likely because of anonymous auth.'
          );
        }
      } catch (error) {
        await this.clear(request);
        throw new SessionExpiredError('Session expired');
      }
    }

    return sessionCookie;
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
   * @deprecated
   *
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

  debugLog(message, label = this.type) {
    if (this.authDebugEnabled) {
      try {
        if (typeof message !== 'string') {
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
      this.clear(request, true);
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
      this.config.get('searchguard.multitenancy.enabled')
    ) {

      let userTenantInfo;
      let allTenants = {};

      try {
        userTenantInfo = await this.searchGuardBackend.getUserTenantInfo({authorization: authResponse.session.credentials.authHeaderValue});
        userTenantInfo = this.searchGuardBackend.removeNonExistingReadOnlyTenants(userTenantInfo);
        allTenants = this.searchGuardBackend.convertUserTenantsToRecord(userTenantInfo.data.tenants);
      } catch (error) {
        this.logger.info(`Could not retrieve the user tenants`);
      }

      if (!userTenantInfo || Object.keys(allTenants).length === 0) {
        throw new MissingTenantError(
          'No tenant available for this user, please contact your system administrator.'
        );
      }
    }

    // If we used any additional auth headers when authenticating, we need to store them in the session
    /* @todo Was used with sg_impersonate_as
    authResponse.session.additionalAuthHeaders = null;
    if (Object.keys(additionalAuthHeaders).length) {
      authResponse.session.additionalAuthHeaders = additionalAuthHeaders;
    }

     */

    const cookie = (await this.sessionStorageFactory.asScoped(request).get()) || {};
    authResponse.session = { ...cookie, ...authResponse.session };

    await this.sessionStorageFactory.asScoped(request).set(authResponse.session);

    return authResponse;
  }

  async logout({ request, response }) {
    await this.clear(request, true);
    return response.ok({
      body: {
        authType: this.type,
        // @todo Use the kibana_url from the config?
        redirectURL: this.basePath + '/searchguard/login?type=' + this.type + 'Logout',
      },
    });
  }

  /**
   * Remove the credentials from the session cookie
   */
  async clear(request, explicitlyRemoveAuthType = false) {
    const sessionCookie = (await this.sessionStorageFactory.asScoped(request).get()) || {};
    const authHeaders = this.getAuthHeader(sessionCookie);
    // @todo Consider refactoring anything auth related into an "auth" property.
    delete sessionCookie.credentials;
    delete sessionCookie.username;
    if (explicitlyRemoveAuthType) {
      delete sessionCookie.authType;
      delete sessionCookie.authTypeId;
    }
    delete sessionCookie.additionalAuthHeaders;

    // Only try to delete the session if we really have auth headers
    if (authHeaders) {
      try {
        await this.searchGuardBackend.logoutSession(authHeaders);
      } catch (error) {
        this.logger.error(`Failed to delete the session token: ${error.stack}`);
      }
    }

    return await this.sessionStorageFactory.asScoped(request).set(sessionCookie);
  }
}
