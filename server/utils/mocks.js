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

export function getCookieExpiryTimeMS(expireInDaysFromNow = 0) {
  const today = new Date();
  const expiryTime = new Date(today);
  expiryTime.setDate(expiryTime.getDate() + expireInDaysFromNow);
  return expiryTime.getTime();
}

export function getCookieExpiryTimeS(...props) {
  return Math.floor(getCookieExpiryTimeMS(...props) / 1000);
}

export function setupHttpRouterMock({ ensureRawRequest = () => jest.fn() } = {}) {
  return {
    ensureRawRequest,
  };
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

export function setupKibanaCoreMock({
  basePath = '/abc',
  registerOnPreResponse = jest.fn(),
  getServerInfo = jest.fn(),
} = {}) {
  return {
    http: {
      getServerInfo,
      basePath: {
        get: jest.fn(() => basePath),
      },
      registerOnPreResponse,
    },
  };
}

export function setupConfigMock({ get = jest.fn() } = {}) {
  return {
    get,
  };
}

export function setupLoggerMock({
  info = jest.fn(),
  error = jest.fn(),
  warn = jest.fn(),
  debug = jest.fn(),
} = {}) {
  return {
    error,
    info,
    warn,
    debug,
  };
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

export function setupSavedObjectsMock({
  getScopedClient = jest.fn(),
  createInternalRepository = jest.fn(),
  createScopedRepository= jest.fn(),
  createSerializer = jest.fn(),
  createExporter = jest.fn(),
  createImporter= jest.fn(),
  getTypeRegistry= setupTypeRegistryMock,
} = {}) {
  return {
    getScopedClient,
    createInternalRepository,
    createScopedRepository,
    createSerializer,
    createExporter,
    createImporter,
    getTypeRegistry,
  };
}

export function setupHttpResponseMock({
  ok = jest.fn(),
  redirected = jest.fn(),
  unauthorized = jest.fn(),
  notFound = jest.fn(),
  internalError = jest.fn(),
  renderAnonymousCoreApp = jest.fn(),
  customError = jest.fn(),
  badRequest = jest.fn(),
} = {}) {
  return {
    ok,
    redirected,
    unauthorized,
    notFound,
    internalError,
    renderAnonymousCoreApp,
    customError,
    badRequest,
  };
}

export function setupHttpToolkitMock({
  next = jest.fn(),
  notHandled = jest.fn(),
  authenticated = jest.fn(),
} = {}) {
  return {
    next,
    notHandled,
    authenticated,
  };
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

export function setupContextMock() {
  return jest.fn();
}

export function setupDebugLogMock() {
  return jest.fn();
}

export function setupClusterClientMock({
  asCurrentUserTransportRequest = jest.fn(),
  asCurrentUserScroll = jest.fn(),
  asCurrentUserSearch = jest.fn(),
  asCurrentUserDelete = jest.fn(),
  asCurrentUserCatAliases = jest.fn(),
  asCurrentUserCatIndices = jest.fn(),
  asCurrentUserIndicesGetMapping = jest.fn(),
} = {}) {
  return {
    asScoped: jest.fn(() => {
      return {
        asCurrentUser: {
          transport: { request: asCurrentUserTransportRequest },
          scroll: asCurrentUserScroll,
          search: asCurrentUserSearch,
          delete: asCurrentUserDelete,
          cat: {
            aliases: asCurrentUserCatAliases,
            indices: asCurrentUserCatIndices,
          },
          indices: {
            getMapping: asCurrentUserIndicesGetMapping,
          },
        },
      };
    }),
  };
}

export function setupFetchAllFromScrollMock(mockFn = jest.fn()) {
  return mockFn;
}
