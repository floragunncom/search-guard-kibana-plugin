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

import { parse } from 'url';
import { assign } from 'lodash';
import { ensureRawRequest } from '@kbn/core-http-router-server-internal';
import { GLOBAL_TENANT_NAME, MISSING_TENANT_PARAMETER_VALUE, PRIVATE_TENANT_NAME } from "../../../common/multitenancy";

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
    kibanaCore,
    clusterClient,
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
    this.clusterClient = clusterClient;
    this.basePath = kibanaCore.http.basePath.get();
  }


  onPreAuth = async (request, response, toolkit) => {

    const authType = this.configService.get('searchguard.auth.type');
    const debugEnabled = this.configService.get('searchguard.multitenancy.debug');

    const externalTenant = this.getExternalTenant(request, debugEnabled);

    // If we have an externalTenant, we will continue so that we can
    // update the cookie's tenant value
    if (!this.isRelevantPath(request) && !externalTenant) {
      return toolkit.next();
    }

    let selectedTenant = null;

    const {authHeaders, sessionCookie} = await this.getSession(request);
    const isAuthenticatedRequest = (authType === 'proxy' || (authHeaders && authHeaders.authorization)) ? true : false;

    // We may run into ugly issues with the capabilities endpoint here if
    // we let through an unauthenticated request, despite try/catch
    // Hence, only call the tenant endpoint if we are using proxy
    // or have an authorization header.
    if (!isAuthenticatedRequest) {
      return toolkit.next();
    }

    // Check if MT is enabled in the backend
    const { kibana_mt_enabled } = await this.searchGuardBackend.getKibanaInfoWithInternalUser();
    this.configService.set('searchguard.multitenancy.enabled', kibana_mt_enabled || false);

    // Skip early if MT is not enabled
    if (!kibana_mt_enabled) {
      return toolkit.next();
    }

    try {
      if (this.clusterClient.config.requestHeadersWhitelist.indexOf('sgtenant') === -1) {
        this.clusterClient.config.requestHeadersWhitelist.push('sgtenant');
      }
    } catch (error) {
      this.logger.error(`Multitenancy: Could not check headers whitelist ${request.url.pathname}. ${error}`);
    }


    // The capabilities route may break the entire screen if
    // we get a 401 when retrieving the tenants. So for the
    // default capabilities, we can just skip MT here.
    if (request.url.pathname.indexOf('capabilities') > -1 && request.url.searchParams.get('useDefaultCapabilities') === "true") {
      return toolkit.next();
    }

    let userTenantInfo;
    try {
      // We need the user's data from the backend to validate the selected tenant
      userTenantInfo = await this.searchGuardBackend.getUserTenantInfo(authHeaders);
      if (!userTenantInfo.data.multi_tenancy_enabled) {
        // MT is disabled, we don't need to do anything.
        // This should have been checked earlier though, so this is just a fail safe.
        return toolkit.next();
      }

      selectedTenant = await this.getSelectedTenant({
        request,
        sessionCookie,
        username: userTenantInfo.data.username,
        externalTenant,
        userTenantInfo,
      });
    } catch (error) {
      this.logger.error(`Multitenancy: Could not get tenant info from ${request.url.pathname}. ${error}`);

      if (error.statusCode === 401) {
        return toolkit.next();
      }

    }

    const requestHasRequestedTenant = (externalTenant || typeof sessionCookie.tenant !== 'undefined');
    // If we have an external tenant, but the selectedTenant is null
    // after validation, that means that the user does not have
    // access to the requested tenant, or it does not exist
    if (selectedTenant === null && requestHasRequestedTenant) {
      if (request.url.pathname.startsWith('/app') || request.url.pathname === '/') {

        // If we have the wrong tenant in the cookie, we need to reset the cookie tenant value
        const shouldResetCookieTenant = (!externalTenant && typeof sessionCookie.tenant !== 'undefined');
        if (shouldResetCookieTenant) {
          delete sessionCookie.tenant;
          await this.sessionStorageFactory.asScoped(request).set(sessionCookie);
        }

        if (request.url.searchParams.get('sgtenantsmenu') !== MISSING_TENANT_PARAMETER_VALUE) {
          return response.redirected({
            body: 'Wrong tenant',
            //statusCode: 401,
            headers: {
              'location': this.basePath + `/app/home?sgtenantsmenu=` + MISSING_TENANT_PARAMETER_VALUE,
            },
          });
        }

      } else {
        // TODO maybe just pass through and let the backend return an error?
        return response.unauthorized();
      }
    }

    // We have a tenant to use
    if (selectedTenant !== null) {
      const rawRequest = ensureRawRequest(request);
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
    } else {
      let authRequiredForRoute = false;
      try {
        authRequiredForRoute = request.route.options.authRequired;
      } catch (error) {
        // Ignore
      }

      // Could also be "optional" or false
      if (authRequiredForRoute === true) {
        return response.redirected({
          body: 'Missing Tenant',
          //statusCode: 401,
          headers: {
            'location': this.basePath + `/searchguard/login?err=` + MISSING_TENANT_PARAMETER_VALUE,
          },
        });
      }
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
      this.logger.info(`Multitenancy: tenant_storagecookie ${selectedTenant}`);
    }

    if (externalTenant) {
      selectedTenant = externalTenant;
    }

    /**
     * @type {Record<string, boolean>}
     */
    const userTenants = this.searchGuardBackend.convertUserTenantsToRecord(userTenantInfo.data.tenants);

    // if we have a tenant, check validity and set it
    if (typeof selectedTenant !== 'undefined' && selectedTenant !== null && selectedTenant !== "") {
      selectedTenant = backend.validateRequestedTenant(
        username,
        selectedTenant,
        userTenants,
      );
    } else if (userTenantInfo && userTenantInfo.data.default_tenant) {
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
