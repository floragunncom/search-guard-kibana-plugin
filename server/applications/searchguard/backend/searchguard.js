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

import _ from 'lodash';
import filterAuthHeaders from '../auth/filter_auth_headers';
import AuthenticationError from '../auth/errors/authentication_error';
import User from '../auth/user';

/**
 * The SearchGuard  backend.
 */
export default class SearchGuardBackend {
  constructor({ configService, getElasticsearch }) {
    this.getElasticsearch = getElasticsearch;
    this.configService = configService;
    this.requestHeadersWhitelist = this.configService.get('elasticsearch.requestHeadersWhitelist');
  }

  async _client({ headers = {}, asWho = 'asCurrentUser', ...options }) {
    const elasticsearch = await this.getElasticsearch();
    const { body } = await elasticsearch.client
      .asScoped({ headers })
      [asWho].transport.request(options);

    return body;
  }

  async authenticate(credentials) {
    const authHeader = Buffer.from(`${credentials.username}:${credentials.password}`).toString(
      'base64'
    );
    try {
      const response = await this._client({
        path: '/_searchguard/authinfo',
        method: 'get',
        headers: {
          authorization: `Basic ${authHeader}`,
        },
      });

      return new User(
        credentials.username,
        credentials,
        credentials,
        response.sg_roles,
        response.backend_roles,
        response.sg_tenants,
        response.user_requested_tenant
      );
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError('Invalid username or password', error);
      }
      throw error;
    }
  }

  async authenticateWithHeader(headerName, headerValue, additionalAuthHeaders = {}) {
    try {
      const credentials = {
        headerName: headerName,
        headerValue: headerValue,
      };

      const headers = filterAuthHeaders(additionalAuthHeaders, this.requestHeadersWhitelist);

      // For anonymous auth, we wouldn't have any value here
      if (headerValue) {
        headers[headerName] = headerValue;
      }
      const response = await this._client({
        path: '/_searchguard/authinfo',
        method: 'get',
        headers,
      });

      return new User(
        response.user_name,
        credentials,
        null,
        response.sg_roles,
        response.backend_roles,
        response.sg_tenants,
        response.user_requested_tenant
      );
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError('Invalid username or password', error);
      }
      throw error;
    }
  }

  /**
   * A wrapper for authinfo() when we expect a response to be used for a cookie
   * @param headers
   * @param credentials
   * @returns {Promise<User>}
   */
  async authenticateWithHeaders(headers, credentials = {}, additionalAuthHeaders = {}) {
    headers = {
      ...filterAuthHeaders(additionalAuthHeaders, this.requestHeadersWhitelist),
      ...headers,
    };

    try {
      const response = await this._client({
        path: '/_searchguard/authinfo',
        method: 'get',
        headers,
      });

      return new User(
        response.user_name,
        credentials,
        null,
        response.sg_roles,
        response.backend_roles,
        response.sg_tenants,
        response.user_requested_tenant
      );
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError('Invalid username or password', error);
      }
      throw error;
    }
  }

  buildSessionResponse(credentials, authInfoResponse) {
    return new User(
      authInfoResponse.user_name,
      credentials,
      null,
      authInfoResponse.sg_roles,
      authInfoResponse.backend_roles,
      authInfoResponse.sg_tenants,
      authInfoResponse.user_requested_tenant
    );
  }

  async authinfo(headers) {
    try {
      const authHeaders = filterAuthHeaders(headers, this.requestHeadersWhitelist);
      return await this._client({
        path: '/_searchguard/authinfo',
        method: 'get',
        headers: authHeaders,
      });
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      throw error;
    }
  }

  async getOIDCWellKnown() {
    return await this._client({
      path: '/_searchguard/auth_domain/_first/openid/config',
      method: 'get',
    });
  }

  /**
   * Get the id_token
   * @param tokenEndpoint
   * @param body
   * @returns {Promise<*>}
   */
  async getOIDCToken({ tokenEndpoint, body }) {
    return await this._client({
      path: tokenEndpoint,
      method: 'post',
      body,
    });
  }

  async getSamlHeader() {
    try {
      return await this._client({
        path: '/_searchguard/authinfo',
        method: 'get',
      });
    } catch (error) {
      const wwwAuthenticateDirective = error.meta.headers['www-authenticate'];
      if (!wwwAuthenticateDirective) {
        throw error;
      }

      try {
        const locationRegExp = /location="(.*?)"/;
        const requestIdRegExp = /requestId="(.*?)"/;

        return {
          location: locationRegExp.exec(wwwAuthenticateDirective)[1],
          requestId: requestIdRegExp.exec(wwwAuthenticateDirective)[1],
        };
      } catch (error) {
        throw new AuthenticationError(error.message, error);
      }
    }
  }

  /**
   * Exchanges a SAMLResponse from the IdP against a token for internal use
   * @param RequestId
   * @param SAMLResponse
   * @param acsEndpoint
   * @returns {Promise<Promise<*>|*>}
   */
  async authtoken(RequestId, SAMLResponse, acsEndpoint = null) {
    const body = {
      RequestId,
      SAMLResponse,
      acsEndpoint,
    };

    try {
      return await this._client({
        path: '/_searchguard/api/authtoken',
        method: 'post',
        body,
      });
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      throw error;
    }
  }

  async getKibanaInfoWithInternalUser() {
    try {
      return await this._client({
        path: '/_searchguard/kibanainfo',
        method: 'get',
        asWho: 'asInternalUser',
      });
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      throw error;
    }
  }

  /**
   * Check for application permissions
   * @param headers
   * @param permissions
   * @returns {Promise<*>}
   */
  async hasPermissions(headers, permissions) {
    try {
      const authHeaders = filterAuthHeaders(headers, this.requestHeadersWhitelist);
      return await this._client({
        path: '/_searchguard/permission',
        method: 'get',
        headers: authHeaders,
        querystring: { permissions },
      });
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      throw error;
    }
  }

  async multitenancyinfo(headers) {
    try {
      const authHeaders = filterAuthHeaders(headers, this.requestHeadersWhitelist);
      return await this._client({
        path: '/_searchguard/kibanainfo',
        method: 'get',
        headers: authHeaders,
      });
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      throw error;
    }
  }

  async systeminfo(headers) {
    try {
      const authHeaders = filterAuthHeaders(headers, this.requestHeadersWhitelist);
      return await this._client({
        path: '/_searchguard/license',
        method: 'get',
        headers: authHeaders,
      });
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      throw error;
    }
  }

  async getTenantInfoWithInternalUser() {
    try {
      return await this._client({
        path: '/_searchguard/tenantinfo',
        method: 'get',
        asWho: 'asInternalUser',
      });
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      throw error;
    }
  }

  async getTenantInfo(headers) {
    try {
      const authHeaders = filterAuthHeaders(headers, this.requestHeadersWhitelist);
      return await this._client({
        path: '/_searchguard/tenantinfo',
        method: 'get',
        headers: authHeaders,
      });
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      throw error;
    }
  }

  async uploadLicense(headers, body) {
    try {
      const authHeaders = filterAuthHeaders(headers, this.requestHeadersWhitelist);
      return await this._client({
        path: '/_searchguard/api/license',
        method: 'put',
        headers: authHeaders,
        body,
      });
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      throw error;
    }
  }

  /**
   * @deprecated, use the sessionPlugin instead
   * @param user
   * @returns {Promise<{authorization: string}>}
   */
  async getAuthHeaders(user) {
    const credentials = user.credentials;
    const authHeader = Buffer.from(`${credentials.username}:${credentials.password}`).toString(
      'base64'
    );
    return {
      authorization: `Basic ${authHeader}`,
    };
  }

  getAuthHeaders(username, password) {
    const authHeader = Buffer.from(`${username}:${password}`).toString('base64');
    return {
      authorization: `Basic ${authHeader}`,
    };
  }

  getUser(username, password) {
    const credentials = { username: username, password: password };
    const user = new User(credentials.username, credentials, credentials, [], {});
    return user;
  }

  getServerUser() {
    return this.getUser(
      this.configService.get('elasticsearch.username'),
      this.configService.get('elasticsearch.password')
    );
  }

  updateAndGetTenantPreferences(request, user, tenant) {
    /*
    const preferencesCookieName = this.configService.get(
      'searchguard.cookie.preferences_cookie_name'
    );

     */

    //const prefs = request.state[preferencesCookieName];
    const prefs = {};
    // no prefs cookie present
    if (!prefs) {
      const newPrefs = {};
      newPrefs[user] = tenant;
      return newPrefs;
    }
    prefs[user] = tenant;
    return prefs;
  }

  getTenantByPreference(
    request,
    username,
    tenants,
    preferredTenants,
    globalEnabled,
    privateEnabled
  ) {
    // delete user from tenants first to check if we have a tenant to choose from at all
    // keep original preferences untouched, we need the original values again
    // http://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
    const tenantsCopy = JSON.parse(JSON.stringify(tenants));
    delete tenantsCopy[username];

    // sanity check
    if (!globalEnabled && !privateEnabled && _.isEmpty(tenantsCopy)) {
      return null;
    }

    // Evaluate preferredTenants from kibana config
    if (preferredTenants && !_.isEmpty(preferredTenants)) {
      for (let i = 0; i < preferredTenants.length; i++) {
        const check = preferredTenants[i].toLowerCase();

        if (globalEnabled && (check === 'global' || check === '__global__')) {
          return '';
        }

        if (
          privateEnabled &&
          (check === 'private' || check === '__user__') &&
          tenants[username] !== undefined
        ) {
          return '__user__';
        }

        if (tenants[check] !== undefined) {
          return check;
        }
        if (check.toLowerCase() === 'private' && privateEnabled) {
          return '__user__';
        }
      }
    }

    // no pref in cookie, no preferred tenant in kibana, use GLOBAL, Private or the first tenant in the list
    if (globalEnabled) {
      return '';
    }

    if (privateEnabled) {
      return '__user__';
    } else {
      delete tenants[username];
    }

    // sort tenants by putting the keys in an array first
    const tenantkeys = [];
    let k;

    for (k in tenants) {
      if (tenants.hasOwnProperty(k)) {
        tenantkeys.push(k);
      }
    }
    tenantkeys.sort();
    return tenantkeys[0];
  }

  validateTenant(username, requestedTenant, tenants, globalEnabled, privateEnabled) {
    // delete user from tenants first to check if we have a tenant to choose from at all
    // keep original preferences untouched, we need the original values again
    // http://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
    const tenantsCopy = JSON.parse(JSON.stringify(tenants));
    delete tenantsCopy[username];

    // sanity check: no global, no private, no other tenants -> no tenant available
    if (!globalEnabled && !privateEnabled && _.isEmpty(tenantsCopy)) {
      return null;
    }

    // requested tenant accessible for user
    if (tenants[requestedTenant] !== undefined) {
      return requestedTenant;
    }

    if (
      (requestedTenant === '__user__' || requestedTenant === 'private') &&
      tenants[username] &&
      privateEnabled
    ) {
      return '__user__';
    }

    if ((requestedTenant === 'global' || requestedTenant === '') && globalEnabled) {
      return '';
    }

    return null;
  }
}
