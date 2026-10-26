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

/* global jest */
import {
  coreMock,
  elasticsearchServiceMock,
  httpServerMock,
  httpServiceMock,
  loggingSystemMock,
  savedObjectsServiceMock,
} from '@kbn/core/server/mocks';

// The Kibana facing helpers below wrap the jest mocks Kibana ships for its real
// contracts (@kbn/core/server/mocks). A method Kibana removed is missing from
// the mock too, so a test calling it fails here instead of at runtime. The
// Search Guard facing helpers (backend, config, session storage, auth
// instance) stay hand-written: they mock our own code.

export function getCookieExpiryTimeMS(expireInDaysFromNow = 0) {
  const today = new Date();
  const expiryTime = new Date(today);
  expiryTime.setDate(expiryTime.getDate() + expireInDaysFromNow);
  return expiryTime.getTime();
}

export function getCookieExpiryTimeS(...props) {
  return Math.floor(getCookieExpiryTimeMS(...props) / 1000);
}

export function setupSearchGuardBackendMock({
  authinfo = jest.fn(),
  validateTenant = jest.fn(),
  validateRequestedTenant = jest.fn(),
  hasPermissions = jest.fn(),
  getTenantByPreference = jest.fn(),
  authenticateWithHeader = jest.fn(),
  authenticateWithHeaders = jest.fn(),
  getTenantInfoWithInternalUser = jest.fn(),
  getOIDCWellKnown = jest.fn(),
  getOIDCToken = jest.fn(),
  getUserTenantInfo = jest.fn(),
  convertUserTenantsToRecord = jest.fn(),
  removeNonExistingReadOnlyTenants = jest.fn(),
} = {}) {
  return {
    authinfo,
    validateTenant,
    validateRequestedTenant,
    hasPermissions,
    getTenantByPreference,
    authenticateWithHeader,
    authenticateWithHeaders,
    getTenantInfoWithInternalUser,
    getOIDCWellKnown,
    getOIDCToken,
    getUserTenantInfo,
    convertUserTenantsToRecord,
    removeNonExistingReadOnlyTenants,
  };
}

/** Kibana's CoreSetup mock; pass overrides for the few things a test cares about. */
export function setupKibanaCoreMock({ serverBasePath } = {}) {
  const core = coreMock.createSetup();
  if (serverBasePath !== undefined) {
    core.http.basePath.serverBasePath = serverBasePath;
  }
  return core;
}

/** A KibanaRequest as Kibana's router builds it: `{ headers, path, params, query, body, routeAuthRequired }`. */
export function setupKibanaRequestMock(options = {}) {
  return httpServerMock.createKibanaRequest(options);
}

export function setupConfigMock({ get = jest.fn() } = {}) {
  return {
    get,
  };
}

export function setupLoggerMock(overrides = {}) {
  return Object.assign(loggingSystemMock.createLogger(), overrides);
}

export function setupSessionStorageFactoryMock({ asScoped = jest.fn() } = {}) {
  return {
    asScoped,
  };
}

export function setupPluginDependenciesMock() {
  return jest.fn();
}

export function setupTypeRegistryMock({
  getAllTypes = jest.fn().mockReturnValue([]),
} = {}) {
  return {
    getAllTypes,
  };
}

export function setupSavedObjectsMock(overrides = {}) {
  return Object.assign(savedObjectsServiceMock.createStartContract(), overrides);
}

/** Kibana's KibanaResponseFactory mock. Note: there is no `internalError`, use `customError`. */
export function setupHttpResponseMock(overrides = {}) {
  return Object.assign(httpServerMock.createResponseFactory(), overrides);
}

/** The toolkit of an onPreAuth / auth lifecycle handler. */
export function setupHttpToolkitMock(overrides = {}) {
  return Object.assign(
    { ...httpServiceMock.createOnPreAuthToolkit(), ...httpServiceMock.createAuthToolkit() },
    overrides
  );
}

export function setupAuthInstanceMock({
  getAllAuthHeaders = jest.fn(),
  handleAuthenticateWithHeaders = jest.fn(),
  handleAuthenticate = jest.fn(),
  clear = jest.fn(),
} = {}) {
  return {
    getAllAuthHeaders,
    handleAuthenticateWithHeaders,
    handleAuthenticate,
    clear,
  };
}

/** The request handler context Kibana passes to route handlers. */
export function setupContextMock() {
  return coreMock.createCustomRequestHandlerContext({ core: coreMock.createRequestHandlerContext() });
}

export function setupDebugLogMock() {
  return jest.fn();
}

/**
 * Kibana's IClusterClient mock. The functions a test passes in are installed as
 * the implementation of the corresponding client method, so the test can keep
 * asserting on its own jest.fn().
 */
export function setupClusterClientMock({
  asCurrentUserTransportRequest = jest.fn(),
  asCurrentUserScroll = jest.fn(),
  asCurrentUserSearch = jest.fn(),
  asCurrentUserDelete = jest.fn(),
  asCurrentUserCatAliases = jest.fn(),
  asCurrentUserCatIndices = jest.fn(),
  asCurrentUserIndicesGetMapping = jest.fn(),
} = {}) {
  const clusterClient = elasticsearchServiceMock.createClusterClient();
  const { asCurrentUser } = clusterClient.asScoped();
  clusterClient.asScoped.mockClear();
  asCurrentUser.transport.request.mockImplementation(asCurrentUserTransportRequest);
  asCurrentUser.scroll.mockImplementation(asCurrentUserScroll);
  asCurrentUser.search.mockImplementation(asCurrentUserSearch);
  asCurrentUser.delete.mockImplementation(asCurrentUserDelete);
  asCurrentUser.cat.aliases.mockImplementation(asCurrentUserCatAliases);
  asCurrentUser.cat.indices.mockImplementation(asCurrentUserCatIndices);
  asCurrentUser.indices.getMapping.mockImplementation(asCurrentUserIndicesGetMapping);
  return clusterClient;
}

export function setupFetchAllFromScrollMock(mockFn = jest.fn()) {
  return mockFn;
}
