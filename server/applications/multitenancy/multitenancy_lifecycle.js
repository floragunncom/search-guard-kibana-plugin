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

import { get, assign } from 'lodash';
import { ensureRawRequest } from '../../../../../src/core/server/http/router';

export class MultitenancyLifecycle {
  constructor({
    authManager,
    kerberos,
    searchGuardBackend,
    configService,
    sessionStorageFactory,
    logger,
    clusterClient,
    pluginDependencies,
  }) {
    this.authManager = authManager;
    this.searchGuardBackend = searchGuardBackend;
    this.configService = configService;
    this.sessionStorageFactory = sessionStorageFactory;
    this.logger = logger;
    this.clusterClient = clusterClient;
    this.pluginDependencies = pluginDependencies;
    this.kerberos = kerberos;
  }

  onPreAuth = async (request, response, toolkit) => {
    let authHeaders = request.headers;
	let sessionCookie;

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

    const selectedTenant = await this.getSelectedTenant({
      request,
      authHeaders,
      sessionCookie,
    });

    if (selectedTenant !== null) {
      const rawRequest = ensureRawRequest(request);
      assign(rawRequest.headers, authHeaders, { sgtenant: selectedTenant || '' });

      if (this.pluginDependencies.spaces) {
        await this.createDefaultSpace({ request, selectedTenant });
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
      !path.startsWith('/opensearch') &&
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
      this.logger.info(`Multitenancy: Could not get authinfo ${error}`, error);
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
    if (request.url.query && (request.url.query.sg_tenant || request.url.query.sgtenant)) {
      externalTenant = request.url.query.sg_tenant
        ? request.url.query.sg_tenant
        : request.url.query.sgtenant;

      if (debugEnabled) {
        this.logger.info(`Multitenancy: tenant_url_param' ${externalTenant}`);
      }
    }

    return externalTenant;
  };

  /**
   *  * If we have a new tenant with no default space, we need to create it.
   * This works on post auth, unfortunately after Spaces has redirected
   * to the spaces selector. Hence, the default space will only be
   * visible after a browser reload.
   * @param request
   * @param authHeaders
   * @param selectedTenant
   * @returns {Promise<void|boolean>}
   */
  createDefaultSpace = async ({ request, selectedTenant }) => {
    const kibanaIndex = this.configService.get('opensearchDashboards.index');
    const defaultSpaceId = 'space:default';
    // If the spaces doesn't work, check the default doc structure
    // in the Kibana version you use. Maybe the doc changed.
    const defaultSpaceDoc = {
      type: 'space',
      space: {
        name: 'Default',
        description: 'This is your default space!',
        disabledFeatures: [],
        color: '#00bfb3',
        _reserved: true,
      },
      updated_at: new Date().toISOString(),
    };

    // Kibana talks to its index. The SG ES plugin substitutes the Kibana index name with a tenant index name.
    try {
      await this.clusterClient.asScoped(request).asCurrentUser.transport.request({
        method: 'get',
        path: `/${kibanaIndex}/_doc/${defaultSpaceId}`,
      });
    } catch (error) {
      if (error.meta.statusCode === 404) {
        try {
          await this.clusterClient.asScoped(request).asCurrentUser.create({
            id: defaultSpaceId,
            index: kibanaIndex,
            refresh: true,
            body: defaultSpaceDoc,
          });

          this.logger.debug(`Created the default space for tenant "${selectedTenant}"`);
        } catch (error) {
          if (error.meta.statusCode !== 409) {
            this.logger.error(
              `Failed to create the default space for tenant "${selectedTenant}", ${JSON.stringify(
                get(error, 'meta.body', {}),
                null,
                2
              )}`
            );
          }
        }
      } else {
        this.logger.error(
          `Failed to check the default space for tenant "${selectedTenant}", ${JSON.stringify(
            get(error, 'meta.body', {}),
            null,
            2
          )}`
        );
      }
    }
  };
}
