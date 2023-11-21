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

        if (tenants[check] !== undefined) {
          return check;
        }

        if (tenants[check.toLowerCase()] !== undefined) {
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

    return tenantkeys[0];
  }

  validateTenant(username, requestedTenant, tenants, globalEnabled, privateEnabled) {
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

    if (!globalEnabled) {
      delete tenantsCopy[GLOBAL_TENANT_NAME];
    }

    // sanity check: no global, no private, no other tenants -> no tenant available
    if (!globalEnabled && !privateEnabled && _.isEmpty(tenantsCopy)) {
      return null;
    }

    // requested tenant accessible for user
    // TODO do we need to check lowercase here...? Not really, tenants are case sensitive
    if (tenants[requestedTenant] !== undefined) {
      return requestedTenant;
    }

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
