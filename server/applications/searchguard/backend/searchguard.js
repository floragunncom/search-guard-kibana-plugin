/*
 *    Copyright 2021 floragunn GmbH
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
import AuthenticationError from '../auth/errors/authentication_error';
import User from '../auth/user';
import { GLOBAL_TENANT_NAME, PRIVATE_TENANT_NAME } from "../../../../common/multitenancy";

/**
 * The SearchGuard  backend.
 */
export default class SearchGuardBackend {
  constructor({ elasticsearch, configService, core }) {
    this.elasticsearch = elasticsearch;
	this.configService = configService;
	this.core = core;
  }

  _client = async ({ headers = {}, asWho = 'asCurrentUser', ...options }) => {
    const result = await this.elasticsearch.client
      .asScoped({ headers })
      [asWho].transport.request(options);
    return result;
  }

  getAuthConfig = async (nextUrl = null) => {
    try {
      const sgFrontendConfigId = this.configService.get('searchguard.sg_frontend_config_id') || 'default';
	  let frontendBaseUrl = this.configService.get('searchguard.frontend_base_url') || this.core.http.basePath.publicBaseUrl;

	  if (!frontendBaseUrl) {
		let serverInfo = this.core.http.getServerInfo();
		frontendBaseUrl = serverInfo.protocol + "://" + serverInfo.hostname + ":" + serverInfo.port + "/" + this.core.http.basePath.serverBasePath;
	  }

      const response = await this._client({
        path: '/_searchguard/auth/config',
        method: 'POST',
        asWho: 'asInternalUser',
        body: {
		  config_id: sgFrontendConfigId,
          frontend_base_url: frontendBaseUrl,
          next_url: nextUrl,
		}
      });

      return response;
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError('Invalid username or password', error);
      }
      throw error;
    }
  };

  async authenticateWithSession(credentials) {
    try {
      const response = await this._client({
        path: '/_searchguard/auth/session',
        method: 'POST',
        body: credentials,
      });

      return response;
    } catch (error) {
		// TODO remove
      console.log(error);
      throw error;
    }
  }

  async logoutSession(headers) {
    try {
      return await this._client({
        path: '/_searchguard/auth/session',
        method:
          'DELETE',
        headers,
      });
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError('Invalid username or password', error);
      }
      throw error;
    }
  }


  authenticate = async (credentials) => {
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

  authenticateWithHeader = async (headerName, headerValue, additionalAuthHeaders = {}) => {
    try {
      const credentials = {
        headerName: headerName,
        headerValue: headerValue,
      };
      const headers = { ...additionalAuthHeaders };

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
  authenticateWithHeaders = async (headers, credentials = {}, additionalAuthHeaders = {}) => {
    headers = {
      ...additionalAuthHeaders,
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

  createSessionWithHeaders = async (headers, additionalAuthHeaders = {}) => {
    headers = {
      ...additionalAuthHeaders,
      ...headers
    };

    try {
	  return await this._client({
        path: '/_searchguard/auth/session/with_header',
        method: 'POST',
        headers,
      });
    } catch (error) {
      console.log(error);
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

  authinfo = async (headers) => {
    try {
      return await this._client({
        path: '/_searchguard/authinfo',
        method: 'get',
        headers,
      });
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      throw error;
    }
  }

  sessionInfo = async (headers) => {
    try {
      return await this._client({
        path: '/_searchguard/auth/session',
        method: 'get',
        headers,
      });
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      throw error;
    }
  }

  /**
   * NB: type not complete
   * @typedef KibanaInfo
   * @prop {string} user_name
   * @prop {boolean} not_fail_on_forbidden_enabled
   * @prop {boolean} kibana_mt_enabled
   */

  /**
   *
   * @returns {Promise<KibanaInfo>}
   */
  getKibanaInfoWithInternalUser = async () => {
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
  hasPermissions = async (headers, permissions) => {
    try {
      return await this._client({
        path: '/_searchguard/permission',
        method: 'get',
        headers,
        querystring: { permissions },
      });
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      throw error;
    }
  }

  multitenancyinfo = async (headers) => {
    try {
      return await this._client({
        path: '/_searchguard/kibanainfo',
        method: 'get',
        headers,
      });
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      throw error;
    }
  }

  systeminfo = async (headers) => {
    try {
      return await this._client({
        path: '/_searchguard/license',
        method: 'get',
        headers,
      });
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      throw error;
    }
  }

  getTenantInfoWithInternalUser = async () => {
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

  getTenantInfo = async (headers) => {
    try {
      return await this._client({
        path: '/_searchguard/tenantinfo',
        method: 'get',
        headers,
      });
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      throw error;
    }
  }

  /**
   * @typedef UserTenant
   * @prop {boolean} read_access
   * @prop {boolean} write_access
   * @prop {boolean} exists
   */

  /**
   * @typedef UserTenantInfo
   * @prop {number} status
   * @prop {object} data
   * @prop {boolean} data.multi_tenancy_enabled
   * @prop {string} data.username
   * @prop {string?} data.default_tenant
   * @prop {Record<string, UserTenant>} data.tenants
   */


  /**
   *
   * @param headers
   * @returns {Promise<UserTenantInfo>}
   */
  getUserTenantInfo = async (headers) => {
    try {
      return await this._client({
        path: '/_searchguard/current_user/tenants',
        method: 'get',
        headers,
      });
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      throw error;
    }
  }

  /**
   * The user tenant info endpoint contains information about
   * read/write access, as well as an exists flag which
   * is false if the tenant is empty.
   *
   * This function filters out tenants that
   * are read only and does not exist.
   *
   * This is to prevent that a user ends up in
   * an empty tenant with only read access
   *
   * @param {UserTenantInfo} userTenantInfo
   * @returns {UserTenantInfo}
   */
  removeNonExistingReadOnlyTenants = (userTenantInfo) => {
    if (userTenantInfo.data && userTenantInfo.data.tenants) {
      Object.keys(userTenantInfo.data.tenants).forEach((key) => {
        if (userTenantInfo.data.tenants[key].write_access !== true && userTenantInfo.data.tenants[key].exists !== true) {
          delete userTenantInfo.data.tenants[key];
        }
      })
    }

    return userTenantInfo;
  }

  /**
   * Converts the UserTenantInfo tenants to the tenantName = write_access format
   * to stay compatible with existing code
   * @param {Record<string, UserTenant>} userTenants
   * @return {Record<string, boolean>}
   */
  convertUserTenantsToRecord = (userTenants) => {
    /**
     * @type {Record<string, boolean>}
     */
    const tenantsRecord = {};
    Object.keys(userTenants).forEach((tenant) => {
      tenantsRecord[tenant] = userTenants[tenant].write_access;
    });

    return tenantsRecord;
  }

  uploadLicense = async (headers, body) => {
    try {
      return await this._client({
        path: '/_searchguard/api/license',
        method: 'put',
        headers,
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
  getAuthHeaders = async (user) => {
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

    // We have two paths for deciding if the global tenant is available:
    // searchguard.multitenancy.global.enabled and authinfo.sg_tenants
    if (!tenantsCopy.hasOwnProperty(GLOBAL_TENANT_NAME)) {
      globalEnabled = false;
    }

    // Make sure we sync with the backend
    if (!globalEnabled) {
      delete tenantsCopy[GLOBAL_TENANT_NAME];
    }

    // sanity check
    if (!globalEnabled && !privateEnabled && _.isEmpty(tenantsCopy)) {
      return null;
    }

    // Evaluate preferredTenants from kibana config
    if (preferredTenants && !_.isEmpty(preferredTenants)) {
      for (let i = 0; i < preferredTenants.length; i++) {
        //const check = preferredTenants[i].toLowerCase();
        const check = preferredTenants[i];

        if (globalEnabled && (check.toLowerCase() === 'global' || check.toLowerCase() === '__global__')) {
          return GLOBAL_TENANT_NAME;
        }

        if (
          privateEnabled &&
          (check.toLowerCase() === 'private' || check.toLowerCase() === '__user__') &&
          tenants[username] !== undefined
        ) {
          return '__user__';
        }

        // TODO Test if SGS_GLOBAL_TENANT is handled correctly
        if (tenantsCopy[check] !== undefined) {
          return check;
        }

        if (tenantsCopy[check.toLowerCase()] !== undefined) {
          return check.toLowerCase();
        }

        if (check.toLowerCase() === 'private' && privateEnabled) {
          return '__user__';
        }
      }
    }

    // no pref in cookie, no preferred tenant in kibana, use GLOBAL, Private or the first tenant in the list
    if (globalEnabled) {
      return GLOBAL_TENANT_NAME;
    }

    if (privateEnabled) {
      return '__user__';
    } else {
      delete tenants[username];
    }

    // sort tenants by putting the keys in an array first
    let tenantkeys = [];
    let k;

    for (k in tenants) {
      if (tenants.hasOwnProperty(k)) {
        tenantkeys.push(k);
      }
    }
    tenantkeys.sort();

    if (!globalEnabled) {
      tenantkeys = tenantkeys.filter((tenantKey) => tenantKey !== GLOBAL_TENANT_NAME);
    }

    if (tenantkeys.length) {
      return tenantkeys[0];
    }

    return null;
  }

  /**
   *
   * @param username
   * @param requestedTenant
   * @param {Record<string, boolean>} tenants
   * @returns {string|null}
   */
  validateRequestedTenant(username, requestedTenant, tenants) {
    // TODO Do we need to translate the query parameter? global, private etc?
    if (tenants && typeof tenants[requestedTenant] !== 'undefined') {
      return requestedTenant;
    }

    return null;
  }

  /**
   *
   * @param username
   * @param requestedTenant
   * @param {Record<string, boolean>} tenants
   * @param globalEnabled
   * @param privateEnabled
   * @returns {*|string|null}
   */
  validateTenant(username, requestedTenant, tenants, globalEnabled, privateEnabled) {
    // delete user from tenants first to check if we have a tenant to choose from at all
    // keep original preferences untouched, we need the original values again
    // http://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
    const tenantsCopy = JSON.parse(JSON.stringify(tenants));
    delete tenantsCopy[username];

    console.log('>>>>> Validating tenants', requestedTenant, tenants)

    // We have two paths for deciding if the global tenant is available:
    // searchguard.multitenancy.global.enabled and authinfo.sg_tenants
    if (!tenantsCopy.hasOwnProperty(GLOBAL_TENANT_NAME)) {
      globalEnabled = false;
    }

    if (!globalEnabled) {
      delete tenantsCopy[GLOBAL_TENANT_NAME];
    }

    // sanity check: no global, no private, no other tenants -> no tenant available
    if (!globalEnabled && !privateEnabled && _.isEmpty(tenantsCopy)) {
      return null;
    }

    // requested tenant accessible for user
    // TODO do we need to check lowercase here...? Not really, tenants are case sensitive
    if (tenantsCopy[requestedTenant] !== undefined) {
      return requestedTenant;
    }

    // Using tenants instead of tenantsCopy here is intentional
    // because the private tenant is always deleted from the tenantsCopy
    if (
      (requestedTenant === PRIVATE_TENANT_NAME || requestedTenant === 'private') &&
      tenants[username] &&
      privateEnabled
    ) {
      return PRIVATE_TENANT_NAME;
    }

    // This is the path when we have a tenant named global in the query parameter
    if ((requestedTenant === 'global' || requestedTenant === '') && globalEnabled) {
      return GLOBAL_TENANT_NAME;
    }

    return null;
  }
}
