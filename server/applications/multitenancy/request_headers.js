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
import { ensureRawRequest } from '../../../../../src/core/server/http/router';

function isRelevantMultiTenancyPath(request) {
  // MT is only relevant for these paths
  const path = request.url.path;
  if (
    !path.startsWith('/internal/spaces') &&
    !path.startsWith('/internal/search') &&
    !path.startsWith('/goto') &&
    !path.startsWith('/elasticsearch') &&
    !path.startsWith('/api') &&
    !path.startsWith('/app') &&
    path !== '/'
  ) {
    return false;
  }

  return true;
}

/**
 * Check if we have a tenant set as query parameter
 * or as header value
 *
 * @param request
 * @param debugEnabled
 * @returns {null}
 */
function getExternalTenant(request, logger, debugEnabled = false) {
  let externalTenant = null;
  // check for tenant information in HTTP header. E.g. when using the saved objects API
  if (request.headers.sgtenant || request.headers.sg_tenant) {
    externalTenant = request.headers.sgtenant
      ? request.headers.sgtenant
      : request.headers.sg_tenant;

    if (debugEnabled) {
      logger.info(`Multitenancy: tenant_http_header' ${externalTenant}`);
    }
  }
  // check for tenant information in GET parameter. E.g. when using a share link. Overwrites the HTTP header.
  if (request.url.query && (request.url.query.sg_tenant || request.url.query.sgtenant)) {
    externalTenant = request.url.query.sg_tenant
      ? request.url.query.sg_tenant
      : request.url.query.sgtenant;

    if (debugEnabled) {
      logger.info(`Multitenancy: tenant_url_param' ${externalTenant}`);
    }
  }

  return externalTenant;
}

/**
 * Get and validate the selected tenant.
 * @param authHeaders
 * @param sessionCookie
 * @param searchGuardBackend
 * @param config
 * @param sessionStorageFactory
 * @param logger
 * @param request
 * @returns {Promise<string|null>}
 */
export async function handleSelectedTenant({
  authHeaders,
  sessionCookie,
  searchGuardBackend,
  config,
  sessionStorageFactory,
  logger,
  request,
}) {
  const globalEnabled = config.get('searchguard.multitenancy.tenants.enable_global');
  const privateEnabled = config.get('searchguard.multitenancy.tenants.enable_private');
  const preferredTenants = config.get('searchguard.multitenancy.tenants.preferred');
  const debugEnabled = config.get('searchguard.multitenancy.debug');
  const backend = searchGuardBackend;

  // default is the tenant stored in the tenants cookie

  let selectedTenant =
    sessionCookie && typeof sessionCookie.tenant !== 'undefined' ? sessionCookie.tenant : null;

  if (debugEnabled) {
    logger.info(`Multitenancy: tenant_storagecookie ${selectedTenant}`);
  }

  const externalTenant = getExternalTenant(request, logger, debugEnabled);

  // MT is only relevant for some paths.
  // If we have an externalTenant, we need to update the cookie
  // though. Otherwise, if there's a redirect, the query parameter may
  // get lost before we can use it.
  if (!isRelevantMultiTenancyPath(request) && !externalTenant) {
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
    logger.error(`Multitenancy: Could not get authinfo ${error.message}`);
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
    await sessionStorageFactory.asScoped(request).set(sessionCookie);
  }

  if (debugEnabled) {
    logger.info(`Multitenancy: tenant_assigned ${selectedTenant}`);
  }

  return selectedTenant;
}

const defaultSpaceId = 'default';

async function addDefaultSpaceToWriteTenant(logger, spacesClient, defaultSpaceId) {
  try {
    await spacesClient.create({
      id: defaultSpaceId,
      name: 'Default',
      description: 'This is your default space!',
      color: '#00bfb3',
      disabledFeatures: [],
      _reserved: true,
    });
    logger.info(`Multitenancy: Default space created`);

    return true;
  } catch (error) {
    logger.error(`Multitenancy: An error occurred while creating a default space: ${error}`);
    throw error;
  }
}

async function addDefaultSpaceToReadOnlyTenant(
  logger,
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
      logger.error(
        `Multitenancy: Could not find the index name for the tenant while creating a default space for a read only tenant. The tenant is probably empty.`
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
    logger.info(`Multitenancy: Created a default space for a read only tenant: ${tenantName}`);
  } catch (error) {
    logger.error(
      `Multitenancy: An error occurred while creating a default space for a read only tenant ${error}`
    );

    throw error;
  }
}

/**
 * If we have a new tenant with no default space, we need to create it.
 * This works on post auth, unfortunately after Spaces has redirected
 * to the spaces selector. Hence, the default space will only be
 * visible after a browser reload.
 * @param kibanaCore
 * @param spacesPlugin
 * @param logger
 * @param searchGuardBackend
 * @param elasticsearch
 */
export async function handleDefaultSpace({
  request,
  authHeaders,
  selectedTenant,
  pluginDependencies,
  logger,
  searchGuardBackend,
  elasticsearch,
}) {
  // Test for default space if spaces are enabled.
  // The global tenant ('') does not need to be handled
  const spacesPlugin = pluginDependencies.spaces || null;
  if (!spacesPlugin || !selectedTenant) {
    return;
  }

  const isDefaultSpacesRelevantPath =
    request.url.path === '/' ||
    request.url.path.startsWith('/app') ||
    request.url.path.startsWith('/internal/spaces') ||
    request.url.path.startsWith('/spaces');

  if (isDefaultSpacesRelevantPath) {
    const rawRequest = ensureRawRequest(request);
    assign(rawRequest.headers, authHeaders, { sgtenant: selectedTenant });
    const spacesClient = await spacesPlugin.spacesService.scopedClient(rawRequest);
    let defaultSpace = null;

    try {
      defaultSpace = await spacesClient.get(defaultSpaceId);
      logger.info(`Multitenancy: Default space exists ${defaultSpace.id}`);
    } catch (error) {
      logger.info(`Multitenancy: No default space, will try to create`);
      // Most likely not really an error, default space just not found
    }

    if (defaultSpace === null) {
      try {
        const authInfoResponse = await searchGuardBackend.authinfo(rawRequest.headers);
        if (selectedTenant && authInfoResponse.sg_tenants[selectedTenant] === false) {
          await addDefaultSpaceToReadOnlyTenant(
            logger,
            elasticsearch,
            rawRequest,
            searchGuardBackend,
            defaultSpaceId,
            selectedTenant
          );
        } else {
          await addDefaultSpaceToWriteTenant(logger, spacesClient, defaultSpaceId);
        }
      } catch (error) {
        // We can't really recover from this error, so we'll just continue for now.
        // The specific error should have been logged in the respective create method.
      }
    }
  }
}
