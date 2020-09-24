/* eslint-disable @kbn/eslint/require-license-header */
/**
 *    Copyright 2016 floragunn GmbH

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
import { ensureRawRequest } from '../../../../../src/core/server/http/router/request'; //'../../../../../../src/core/server/http/router/request';

export function requestHeaders({
  server,
  searchGuardBackend,
  authInstance,
  config,
  spacesPlugin = null,
  elasticsearch,
  kibanaCore,
  sessionStorageFactory,
  logger,
}) {
  const globalEnabled = config.get('searchguard.multitenancy.tenants.enable_global');
  const privateEnabled = config.get('searchguard.multitenancy.tenants.enable_private');
  const preferredTenants = config.get('searchguard.multitenancy.tenants.preferred');
  const debugEnabled = config.get('searchguard.multitenancy.debug');
  const backend = searchGuardBackend;

  const defaultSpaceId = 'default';

  kibanaCore.http.registerOnPreAuth(async function (request, response, toolkit) {
    // default is the tenant stored in the tenants cookie
    // @todo Check stored tenant
    //let selectedTenant = request.auth.sgSessionStorage.getStorage('tenant', {}).selected;
    const theCookie = (await sessionStorageFactory.asScoped(request).get()) || {};

    let selectedTenant =
      theCookie && typeof theCookie.tenant !== 'undefined' ? theCookie.tenant : null; //@todo <- This is just a temp replacement for the code above
    let externalTenant = null;

    if (debugEnabled) {
      request.log(['info', 'searchguard', 'tenant_storagecookie'], selectedTenant);
    }

    // check for tenant information in HTTP header. E.g. when using the saved objects API
    if (request.headers.sgtenant || request.headers.sg_tenant) {
      externalTenant = request.headers.sgtenant
        ? request.headers.sgtenant
        : request.headers.sg_tenant;

      if (debugEnabled) {
        request.log(['info', 'searchguard', 'tenant_http_header'], externalTenant);
      }
    }
    // check for tenant information in GET parameter. E.g. when using a share link. Overwrites the HTTP header.
    if (request.url.query && (request.url.query.sg_tenant || request.url.query.sgtenant)) {
      externalTenant = request.url.query.sg_tenant
        ? request.url.query.sg_tenant
        : request.url.query.sgtenant;

      if (debugEnabled) {
        request.log(['info', 'searchguard', 'tenant_url_param'], externalTenant);
      }
    }

    // MT is only relevant for these paths
    if (
      !request.url.path.startsWith('/internal/spaces') &&
      !request.url.path.startsWith('/internal/search') &&
      !request.url.path.startsWith('/goto') &&
      !request.url.path.startsWith('/elasticsearch') &&
      !request.url.path.startsWith('/api') &&
      !request.url.path.startsWith('/app') &&
      request.url.path !== '/' &&
      !externalTenant
    ) {
      return toolkit.next();
    }

    let authInfoResponse;

    if (externalTenant) {
      selectedTenant = externalTenant;
    }

    try {
      if (authInstance) {
        authInstance.detectAuthHeaderCredentials(request);
        // @todo THIS needs to go back in, but with correct headers
        //await authInstance.assignAuthHeader(request);
      }
      const authHeaders = await authInstance.assignAuthHeader(request);
      authInfoResponse = await backend.authinfo(authHeaders);
    } catch (error) {
      // @todo Handle this?
      logger.error('Could not get authinfo');
      return toolkit.next();
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

    // @todo This must be fixed
    const cookie = (await authInstance.sessionStorageFactory.asScoped(request).get()) || {};
    const tempTenantFromCookie = cookie.tenant || '';

    //if (selectedTenant !== request.auth.sgSessionStorage.getStorage('tenant', {}).selected) {
    if (selectedTenant !== tempTenantFromCookie) {
      // save validated tenant as preference
      const prefcookie = backend.updateAndGetTenantPreferences(
        request,
        authInfoResponse.user_name,
        selectedTenant
      );

      cookie.tenant = selectedTenant;
      await authInstance.sessionStorageFactory.asScoped(request).set(cookie);

      // @todo Clean up pref cookie things
      //h.state(preferencesCookieName, prefcookie);
    }

    if (debugEnabled) {
      request.log(['info', 'searchguard', 'tenant_assigned'], selectedTenant);
    }

    const headers = {
      ...request.headers,
    };

    if (selectedTenant != null) {
      // @todo We need to fix these header assignments
      const rawRequest = ensureRawRequest(request);
      const authHeaders = await authInstance.assignAuthHeader(request);
      assign(rawRequest.headers, authHeaders);
      //assign(request.headers, { sgtenant: selectedTenant });
      rawRequest.headers.sgtenant = selectedTenant;
    }

    // Test for default space if spaces are enabled and we're on an app path
    const isDefaultSpacesRelevantPath =
      request.url.path === '/' ||
      request.url.path.startsWith('/app') ||
      request.url.path.startsWith('/spaces');
    // @todo PROBABLY NEED TO SET TENANT AND AUTH HEADERS HERE
    if (spacesPlugin && isDefaultSpacesRelevantPath) {
      const spacesClient = await spacesPlugin.spacesService.scopedClient(request);
      let defaultSpace = null;

      try {
        defaultSpace = await spacesClient.get(defaultSpaceId);
        server.log(['searchguard', 'info'], `Default space exists ${defaultSpace.id}`);
      } catch (error) {
        server.log(['searchguard', 'info'], `No default space, will try to create`);
        // Most likely not really an error, default space just not found
      }

      if (defaultSpace === null) {
        try {
          if (selectedTenant && authInfoResponse.sg_tenants[selectedTenant] === false) {
            await addDefaultSpaceToReadOnlyTenant(
              server,
              elasticsearch,
              request,
              backend,
              defaultSpaceId,
              selectedTenant
            );
          } else {
            await addDefaultSpaceToWriteTenant(server, spacesClient, defaultSpaceId);
          }
        } catch (error) {
          // We can't really recover from this error, so we'll just continue for now.
          // The specific error should have been logged in the respective create method.
        }
      }
    }

    return toolkit.next();
  });
}

async function addDefaultSpaceToWriteTenant(server, spacesClient, defaultSpaceId) {
  try {
    await spacesClient.create({
      id: defaultSpaceId,
      name: 'Default',
      description: 'This is your default space!',
      color: '#00bfb3',
      disabledFeatures: [],
      _reserved: true,
    });
    server.log(['searchguard', 'info'], `Default space created`);

    return true;
  } catch (error) {
    server.log(
      ['searchguard', 'error'],
      `An error occurred while creating a default space: ${error}`
    );
    throw error;
  }
}

async function addDefaultSpaceToReadOnlyTenant(
  server,
  elasticsearch,
  request,
  backend,
  defaultSpaceId,
  tenantName
) {
  try {
    const tenantInfo = await backend.getTenantInfoWithInternalUser();

    let indexName = null;
    for (const tenantIndexName in tenantInfo) {
      if (tenantInfo[tenantIndexName] === tenantName) {
        indexName = tenantIndexName;
      }
    }

    // We have one known issue here. If a read only tenant is completely empty, the index will not yet have been created.
    // Hence, we won't retrieve an index name for that tenant.
    if (!indexName) {
      server.log(
        ['searchguard', 'error'],
        `Could not find the index name for the tenant while creating a default space for a read only tenant. The tenant is probably empty.`
      );
      throw new Error('Could not find the index name for the tenant');
    }

    // Call elasticsearch directly without using the Saved Objects Client
    const adminCluster = elasticsearch.adminClient;

    const clientParams = {
      id: `space:${defaultSpaceId}`,
      index: indexName,
      ignore: 409,
      body: {
        type: 'space',
        space: {
          name: 'Default',
          description: 'This is your default space!',
          disabledFeatures: [],
          color: '#00bfb3',
          _reserved: true,
        },
        updated_at: new Date().toISOString(),
      },
    };

    // Create the space
    adminCluster.asScoped(request).callAsCurrentUser('create', clientParams);
    server.log(
      ['searchguard', 'info'],
      `Created a default space for a read only tenant: ${tenantName}`
    );
  } catch (error) {
    server.log(
      ['searchguard', 'error'],
      `An error occurred while creating a default space for a read only tenant ${error}`
    );

    throw error;
  }
}
