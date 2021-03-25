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
import { ensureRawRequest } from '../../../../../src/core/server/http/router';

export class MultitenancyLifecycle {
  constructor({
    authInstance,
    searchGuardBackend,
    configService,
    sessionStorageFactory,
    logger,
    clusterClient,
    pluginDependencies,
    spacesService,
  }) {
    this.authInstance = authInstance;
    this.searchGuardBackend = searchGuardBackend;
    this.configService = configService;
    this.sessionStorageFactory = sessionStorageFactory;
    this.logger = logger;
    this.clusterClient = clusterClient;
    this.pluginDependencies = pluginDependencies;
    this.spacesService = spacesService;
  }

  onPreAuth = async (request, response, toolkit) => {
    const sessionCookie = await this.sessionStorageFactory.asScoped(request).get();
    let authHeaders = request.headers;

    if (this.authInstance) {
      const authCredentialsHeaders = await this.authInstance.getAllAuthHeaders(request);
      if (authCredentialsHeaders) {
        authHeaders = authCredentialsHeaders;
      }
    }

    const selectedTenant = await this.getSelectedTenant({
      request,
      authHeaders,
      sessionCookie,
    });

    if (selectedTenant !== null) {
      const rawRequest = ensureRawRequest(request);
      assign(rawRequest.headers, authHeaders, { sgtenant: selectedTenant || '' });

      if (this.pluginDependencies.spaces) {
        // If we have a new tenant with no default space, we need to create it.
        await this.spacesService.createDefaultSpace({ request, selectedTenant });
      }
    }

    return toolkit.next();
  };

  isRelevantPath = (request) => {
    // MT is only relevant for these paths
    const path = request.url.pathname;
    if (
      !path.startsWith('/internal') &&
      !path.startsWith('/goto') &&
      !path.startsWith('/elasticsearch') &&
      !path.startsWith('/api') &&
      !path.startsWith('/app') &&
      path !== '/'
    ) {
      return false;
    }

    return true;
  };

  /**
   * Get and validate the selected tenant.
   * @param request
   * @param authHeaders
   * @param sessionCookie
   * @returns {Promise<string|null>}
   */
  getSelectedTenant = async ({ request, authHeaders, sessionCookie }) => {
    const globalEnabled = this.configService.get('searchguard.multitenancy.tenants.enable_global');
    const privateEnabled = this.configService.get(
      'searchguard.multitenancy.tenants.enable_private'
    );
    const preferredTenants = this.configService.get('searchguard.multitenancy.tenants.preferred');
    const debugEnabled = this.configService.get('searchguard.multitenancy.debug');
    const backend = this.searchGuardBackend;

    // Make sure we have a sessionCookie object to work with
    if (!sessionCookie) {
      sessionCookie = {};
    }

    // default is the tenant stored in the tenants cookie
    let selectedTenant =
      sessionCookie && typeof sessionCookie.tenant !== 'undefined' ? sessionCookie.tenant : null;

    if (debugEnabled) {
      this.logger.info(`Multitenancy: tenant_storagecookie ${selectedTenant}`);
    }

    const externalTenant = this.getExternalTenant(request, debugEnabled);

    // MT is only relevant for some paths.
    // If we have an externalTenant, we need to update the cookie
    // though. Otherwise, if there's a redirect, the query parameter may
    // get lost before we can use it.
    if (!this.isRelevantPath(request) && !externalTenant) {
      return null;
    }

    if (externalTenant) {
      selectedTenant = externalTenant;
    }

    let authInfoResponse;
    try {
      // We need the user's data from the backend to validate the selected tenant
      authInfoResponse = await backend.authinfo(authHeaders);
    } catch (error) {
      this.logger.error(`Multitenancy: Could not get authinfo ${error}`);
      return null;
    }

    // if we have a tenant, check validity and set it
    if (typeof selectedTenant !== 'undefined' && selectedTenant !== null) {
      selectedTenant = backend.validateTenant(
        authInfoResponse.user_name,
        selectedTenant,
        authInfoResponse.sg_tenants,
        globalEnabled,
        privateEnabled
      );
    } else {
      // no tenant, choose configured, preferred tenant
      try {
        selectedTenant = backend.getTenantByPreference(
          request,
          authInfoResponse.user_name,
          authInfoResponse.sg_tenants,
          preferredTenants,
          globalEnabled,
          privateEnabled
        );
      } catch (error) {
        // nothing
      }
    }

    if (selectedTenant !== sessionCookie.tenant) {
      // save validated tenant in the cookie
      sessionCookie.tenant = selectedTenant;
      await this.sessionStorageFactory.asScoped(request).set(sessionCookie);
    }

    if (debugEnabled) {
      this.logger.info(`Multitenancy: tenant_assigned ${selectedTenant}`);
    }

    return selectedTenant;
  };

  /**
   * Check if we have a tenant set as query parameter
   * or as header value
   *
   * @param request
   * @param debugEnabled
   * @returns {null}
   */
  getExternalTenant = (request, debugEnabled = false) => {
    let externalTenant = null;
    // check for tenant information in HTTP header. E.g. when using the saved objects API
    if (request.headers.sgtenant || request.headers.sg_tenant) {
      externalTenant = request.headers.sgtenant
        ? request.headers.sgtenant
        : request.headers.sg_tenant;

      if (debugEnabled) {
        this.logger.info(`Multitenancy: tenant_http_header' ${externalTenant}`);
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

    return externalTenant;
  };
}
