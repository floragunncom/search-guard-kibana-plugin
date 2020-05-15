/* eslint-disable @kbn/eslint/require-license-header */
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
import MissingTenantError from '../auth/errors/missing_tenant_error';
import MissingRoleError from '../auth/errors/missing_role_error';
import filterAuthHeaders from '../auth/filter_auth_headers';

const Hoek = require('hoek');
const Joi = require('joi');

const internals = {};

internals.config = Joi.object({
  searchGuardBackend: Joi.required(),
  serverConfig: Joi.object(),
  authType: Joi.string().allow(null),
  authHeaderName: Joi.string(),
  allowedAdditionalAuthHeaders: Joi.array().default([]),
  authenticateFunction: Joi.func(),
  validateAvailableTenants: Joi.boolean().default(true),
  validateAvailableRoles: Joi.boolean().default(true),
  /**
   * Name of the cookie where we store additional session information, such as authInfo
   * @type {string}
   */
  storageCookieName: Joi.string().required(),
}).required();

const register = function(server, options) {
  const results = Joi.validate(options, internals.config);
  Hoek.assert(!results.error, results.error);

  const settings = results.value;

  const config = settings.serverConfig;

  const searchGuardBackend = settings.searchGuardBackend;

  // @todo Don't register e.g. authenticate() when we have Kerberos or Proxy-Auth?
  server.ext('onPreAuth', function(request, h) {
    request.auth.sgSessionStorage = {
      /**
       * Tries to authenticate a user. If multitenancy is enabled, we also try to validate that the
       * user has at least one valid tenant
       * @param {object} credentials
       * @returns {Promise<*>}
       */
      authenticate: async function(credentials, options = {}) {
        try {
          const additionalAuthHeaders = filterAuthHeaders(
            request.headers,
            settings.allowedAdditionalAuthHeaders
          );
          // authResponse is an object with .session and .user
          const authResponse = await settings.authenticateFunction(
            credentials,
            options,
            additionalAuthHeaders
          );

          return this._handleAuthResponse(credentials, authResponse, additionalAuthHeaders);
        } catch (error) {
          // Make sure we clear any existing cookies if something went wrong
          this.clear();
          throw error;
        }
      },

      authenticateWithHeaders: async function(headers, credentials = {}, options = {}) {
        try {
          const additionalAuthHeaders = filterAuthHeaders(
            request.headers,
            settings.allowedAdditionalAuthHeaders
          );
          const user = await searchGuardBackend.authenticateWithHeaders(
            headers,
            credentials,
            additionalAuthHeaders
          );
          const session = {
            username: user.username,
            credentials: credentials,
            authType: settings.authType,
            /**
             * Used later to signal that we should not assign any specific auth header in AuthType
             */
            assignAuthHeader: false,
          };

          const sessionTTL = config.get('searchguard.session.ttl');

          if (sessionTTL) {
            session.expiryTime = Date.now() + sessionTTL;
          }

          const authResponse = {
            session,
            user,
          };

          return this._handleAuthResponse(credentials, authResponse, additionalAuthHeaders);
        } catch (error) {
          // Make sure we clear any existing cookies if something went wrong
          this.clear();
          throw error;
        }
      },

      /**
       * Normalized response after an authentication
       * @param credentials
       * @param authResponse
       * @returns {*}
       * @private
       */
      _handleAuthResponse: function(credentials, authResponse, additionalAuthHeaders = {}) {
        // Make sure the user has a tenant that they can use
        if (
          settings.validateAvailableTenants &&
          config.get('searchguard.multitenancy.enabled') &&
          !config.get('searchguard.multitenancy.tenants.enable_global')
        ) {
          const privateTenantEnabled = config.get(
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
          settings.validateAvailableRoles &&
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

        request.cookieAuth.set(authResponse.session);
        this.setAuthInfo(
          authResponse.user.username,
          authResponse.user.backendroles,
          authResponse.user.roles,
          authResponse.user.tenants,
          authResponse.user.selectedTenant
        );

        return authResponse;
      },

      /**
       * Returns the current auth type
       * @returns {void | null}
       */
      getAuthType: function() {
        return settings.authType;
      },

      getAuthHeaderName: function() {
        return settings.authHeaderName;
      },

      /**
       * Remember to call this in the correct lifecycle step. Calling this in onPreAuth will most likely return false because auth is not set up yet.
       * @returns {boolean}
       */
      isAuthenticated: function() {
        if (request.auth && request.auth.isAuthenticated) {
          return true;
        }

        return false;
      },

      /**
       * Get the session credentials
       * @returns {*}
       */
      getSessionCredentials: function() {
        if (this.isAuthenticated()) {
          return request.auth.credentials;
        }

        return null;
      },

      /**
       * Clears the cookies associated with the authenticated user
       */
      clear: function() {
        request.cookieAuth.clear();
        h.unstate(settings.storageCookieName);
      },

      /**
       * Get the content of the storage cookie or, when key is defined, a part of it
       * @param key
       * @param whenMissing - Allows for a default value when the given key is not in the cookie
       * @returns {*}
       */
      getStorage: function(key, whenMissing = null) {
        const storage = request.state[settings.storageCookieName];

        if (!storage) {
          return whenMissing;
        }

        if (!key) {
          return storage;
        }

        if (key && storage[key]) {
          return storage[key];
        }

        return whenMissing;
      },

      /**
       * Store a value in the cookie
       * @param key
       * @param value
       */
      putStorage: function(key, value) {
        const storage = request.state[settings.storageCookieName] || {};

        if (!key) {
          // Bail if we don't have a key, the cookie should contain an object
          return;
        }

        storage[key] = value;

        h.state(settings.storageCookieName, storage);
      },

      /**
       * Clears the extra storage cookie only.
       * Use .clear to remove both the auth and the storage cookies
       *
       */

      /**
       * Clears the extra storage cookie only.
       * Use .clear to remove both the auth and the storage cookies
       *
       * @param key - Pass a key to only delete a part of the storage cookie.
       */
      clearStorage: function(key = null) {
        if (key === null) {
          h.unstate(settings.storageCookieName);
          return;
        }

        const storage = this.getStorage();

        if (storage && storage[key]) {
          delete storage[key];
          h.state(settings.storageCookieName, storage);
        }
      },

      /**
       * Store the result from the authinfo endpoint in the cookie.
       * We don't store everything at the moment.
       * @todo ask Jochen - custom_attribute_names could be too large for a cookie?
       *
       * @param user_name
       * @param backend_roles
       * @param sg_roles
       * @param sg_tenants
       * @param user_requested_tenant
       */
      setAuthInfo: function(user_name, backend_roles, sg_roles, sg_tenants, user_requested_tenant) {
        const authInfo = {
          user_name,
          backend_roles,
          sg_roles,
          sg_tenants,
          user_requested_tenant,
        };

        this.putStorage('authInfo', authInfo);
      },

      /**
       * The storage cookie is coupled to the auth cookie, so we try to validate it similar to
       * how we would validate the auth cookie
       * @returns {*}
       */
      validateStorageCookie: function() {
        let sessionStorage = this.getStorage();
        const authSession = this.getSessionCredentials();

        // If we have an existing storage session and an existing auth session,
        // we can assume that they are connected. We should validate that
        // the auth session hasn't expired
        // @todo Is this really necessary? We write the authInfo every time
        // that we login, and we may need to provide the authInfo even
        // if we don't have an auth session (Kerberos?) @Jochen
        if (sessionStorage && authSession) {
          if (authSession.exp && authSession.exp < Math.floor(Date.now() / 1000)) {
            sessionStorage = null;
          }

          if (authSession.expiryTime && authSession.expiryTime < Date.now()) {
            sessionStorage = null;
          }
        }

        return sessionStorage;
      },

      /**
       * Retrieves the authinfo from the storage cookie, if available.
       * If not available, we pass the request headers to the backend
       * and get the authinfo directly from there
       *
       * @returns {Promise<*>}
       */
      getAuthInfo: async function() {
        // See if we have the value in the cookie
        if (this.getAuthType() !== null) {
          const sessionStorage = this.validateStorageCookie();
          if (sessionStorage && sessionStorage.authInfo) {
            return sessionStorage.authInfo;
          }
        }

        try {
          const authInfo = await searchGuardBackend.authinfo(request.headers);
          // Don't save the authInfo in the cookie for e.g. Kerberos and Proxy-Auth
          if (this.getAuthType() !== null) {
            this.setAuthInfo(
              authInfo.user_name,
              authInfo.backend_roles,
              authInfo.sg_roles,
              authInfo.sg_tenants,
              authInfo.user_requested_tenant
            );
          }

          return authInfo;
        } catch (error) {
          // Remove the storage cookie if something went wrong
          if (this.getAuthType() !== null) {
            h.unstate(settings.storageCookieName);
          }

          throw error;
        }
      },
    };

    return h.continue;
  });
};

exports.plugin = {
  name: 'sg-session-storage',
  register,
};
