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

import { assign } from 'lodash';
import { ensureRawRequest } from '@kbn/core-http-router-server-internal';
import { GLOBAL_TENANT_NAME, PRIVATE_TENANT_NAME } from "../../../common/multitenancy";

export class MultitenancyLifecycle {
  constructor({
    authManager,
    kerberos,
    searchGuardBackend,
    configService,
    sessionStorageFactory,
    logger,
    pluginDependencies,
    spacesService,
    kibanaCore
  }) {
    this.authManager = authManager;
    this.searchGuardBackend = searchGuardBackend;
    this.configService = configService;
    this.sessionStorageFactory = sessionStorageFactory;
    this.logger = logger;
    this.pluginDependencies = pluginDependencies;
    this.spacesService = spacesService;
    this.kerberos = kerberos;
    this.kibanaCore = kibanaCore;

    this.basePath = kibanaCore.http.basePath.get();
  }


  onPreAuth = async (request, response, toolkit) => {
    if (!this.configService.get('searchguard.multitenancy.enabled')) {
      return toolkit.next();
    }

    const debugEnabled = this.configService.get('searchguard.multitenancy.debug');

    const externalTenant = this.getExternalTenant(request, debugEnabled);
    if (!this.isRelevantPath(request) && !externalTenant) {
      return toolkit.next();
    }

    let selectedTenant = null;

    const {authHeaders, sessionCookie} = await this.getSession(request);
    if (!authHeaders) {
      if (debugEnabled) {
        this.logger.info(`Multitenancy: No auth headers, not adding a tenant header`);
      }
      return toolkit.next();
    }

    let userTenantInfo;
    try {
      // We need the user's data from the backend to validate the selected tenant
      userTenantInfo = await this.searchGuardBackend.getUserTenantInfo({ authorization: authHeaders.authorization });
      if (!userTenantInfo.data.multi_tenancy_enabled) {
        // MT is disabled, we don't need to do anything
        return toolkit.next();
      }
      userTenantInfo = this.searchGuardBackend.removeNonExistingReadOnlyTenants(userTenantInfo);

      selectedTenant = await this.getSelectedTenant({
        request,
        sessionCookie,
        username: userTenantInfo.data.username,
        externalTenant,
        userTenantInfo,
      });
    } catch (error) {
      this.logger.error(`Multitenancy: Could not get tenant info from ${request.url.pathname}. ${error}`);
    }

    // If we have an external tenant, but the selectedTenant is null
    // after validation, that means that the user does not have
    // access to the requested tenant, or it does not exist
    if (externalTenant && selectedTenant == null) {
      return response.redirected({
        body: 'Wrong tenant',
        statusCode: 401,
        headers: {
          'location': this.basePath + `/app/home?sgtenantsmenu=abc`,
        },
      });
    }

    if (selectedTenant !== null) {
      const rawRequest = ensureRawRequest(request);

      //assign(rawRequest.headers, authHeaders, { sgtenant: selectedTenant || GLOBAL_TENANT_NAME });
      assign(rawRequest.headers, authHeaders, { sgtenant: selectedTenant });

      if (this.pluginDependencies.spaces) {
        // If we have a new tenant with no default space, we need to create it.
        await this.spacesService.createDefaultSpace({ request, selectedTenant });
      }

      if (selectedTenant !== sessionCookie.tenant) {
        // save validated tenant in the cookie
        sessionCookie.tenant = selectedTenant;
        await this.sessionStorageFactory.asScoped(request).set(sessionCookie);
      }
    } else if (this.isRelevantPath(request)) {
      // TODO Remove this again? Or talk to Lukasz?
      if (sessionCookie.tenant) {
        const rawRequest = ensureRawRequest(request);
        //assign(rawRequest.headers, authHeaders, { sgtenant: sessionCookie.tenant });
        assign(rawRequest.headers, authHeaders, { sgtenant: "fail" });
      }

      this.logger.info(`Multitenancy: No tenant assigned for path:` + request.url.pathname);
    }

    return toolkit.next();
  };



  /**
   * Get and validate the selected tenant.
   * @param request
   * @param sessionCookie
   * @param {string} username
   * @param {string|null} externalTenant
   * @param userTenantInfo
   * @returns {Promise<string|null>}
   */
  getSelectedTenant = async ({ request, sessionCookie, username, externalTenant, userTenantInfo }) => {
    const debugEnabled = this.configService.get('searchguard.multitenancy.debug');
    const backend = this.searchGuardBackend;

    // default is the tenant stored in the tenants cookie
    let selectedTenant =
      sessionCookie && typeof sessionCookie.tenant !== 'undefined' ? sessionCookie.tenant : null;

    if (debugEnabled) {
      //this.logger.info(`Multitenancy: tenant_storagecookie ${selectedTenant}`);
    }

    if (externalTenant) {
      selectedTenant = externalTenant;
    }

    /**
     * @type {Record<string, boolean>}
     */
    const userTenants = this.searchGuardBackend.convertUserTenantsToRecord(userTenantInfo.data.tenants);

    // if we have a tenant, check validity and set it
    if (typeof selectedTenant !== 'undefined' && selectedTenant !== null) {

      // TODO Handle global private alias

      selectedTenant = backend.validateRequestedTenant(
        username,
        selectedTenant,
        userTenants,
      );
    } else if (userTenantInfo.data.default_tenant) {
      selectedTenant = userTenantInfo.data.default_tenant;
    }

    if (debugEnabled) {
      this.logger.info(`Multitenancy: tenant_assigned ${selectedTenant}`);
    }

    return selectedTenant;
  };

  /**
   * Get the auth information needed to make user scoped requests
   * @param request
   * @returns {Promise<{sessionCookie: {}, authHeaders: *}>}
   */
  getSession = async(request) => {
    let sessionCookie;
    let authHeaders = request.headers;
    if (this.authManager) {
        const authInstance = await this.authManager.getAuthInstanceByRequest({ request });

        if (authInstance) {
            sessionCookie = await authInstance.getCookieWithCredentials(request);
            authHeaders = authInstance.getAuthHeader(sessionCookie);
        } else {
            sessionCookie = await this.sessionStorageFactory.asScoped(request).get();
        }
    } else if (this.kerberos) {
        sessionCookie = await this.kerberos.getCookieWithCredentials(request);
        authHeaders = this.kerberos.getAuthHeader(sessionCookie);
    } else {
        sessionCookie = await this.sessionStorageFactory.asScoped(request).get();
    }

    if (!sessionCookie) {
        sessionCookie = {};
    }

    return {
        sessionCookie,
        authHeaders,
    }
  }

  isRelevantPath = (request) => {
    const path = request.url.pathname;

    // MT is only relevant for these paths
    const relevantPaths = [
      '/internal',
      '/goto',
      '/opensearch',
      '/app',
      '/api',
      '/bootstrap.js'
    ];

    // MT is not relevant in these patterns
    const ignorePatterns = [
      '/api/status',
      '/api/v1/auth/config',
      '/api/v1/auth/login',
      '/api/v1/systeminfo',
    ]

    return path === '/' || (
      relevantPaths.some(root => path.startsWith(root)) &&
      !ignorePatterns.some(root => path.startsWith(root))
    );
  };

  /**
   * Check if we have a tenant set as query parameter
   * or as header value
   *
   * @param request
   * @param debugEnabled
   * @returns {null|string}
   */
  getExternalTenant = (request, debugEnabled = false) => {
    let externalTenant = null;
    // check for tenant information in HTTP header. E.g. when using the saved objects API
    if (request.headers.sgtenant || request.headers.sg_tenant) {
      externalTenant = request.headers.sgtenant
        ? request.headers.sgtenant
        : request.headers.sg_tenant;

      if (debugEnabled) {
        this.logger.info(`Multitenancy: tenant_http_header: ${externalTenant}`);
      }
    }
    // check for tenant information in GET parameter. E.g. when using a share link. Overwrites the HTTP header.
    if (request.url.searchParams.has('sg_tenant') || request.url.searchParams.has('sgtenant')) {
      externalTenant = request.url.searchParams.has('sg_tenant')
        ? request.url.searchParams.get('sg_tenant')
        : request.url.searchParams.get('sgtenant');

      if (debugEnabled) {
        this.logger.info(`Multitenancy: tenant_url_param' ${externalTenant}`);
      }
    }

    if (externalTenant !== null) {
      try {
        if (externalTenant.toLowerCase() === 'private') {
          return PRIVATE_TENANT_NAME
        }

        if (externalTenant.toLowerCase() === 'global' || externalTenant.toUpperCase() === GLOBAL_TENANT_NAME) {
          return GLOBAL_TENANT_NAME;
        }
      } catch (error) {
        this.logger.error(`Could not translate private/global tenant: ` + externalTenant);
      }

    }

    return externalTenant;
  };
}
