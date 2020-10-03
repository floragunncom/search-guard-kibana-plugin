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

export function setupHttpRouterMock({ ensureRawRequest = () => jest.fn() } = {}) {
  return {
    ensureRawRequest,
  };
}

export function setupSearchGuardBackendMock({
  authinfo = jest.fn(),
  validateTenant = jest.fn(),
  getTenantByPreference = jest.fn(),
  hasPermissions = jest.fn(),
  getTenantInfoWithInternalUser = jest.fn(),
} = {}) {
  return {
    authinfo,
    validateTenant,
    getTenantByPreference,
    hasPermissions,
    getTenantInfoWithInternalUser,
  };
}

export function setupKibanaCoreMock({ basePath = '/abc', registerOnPreResponse = jest.fn() } = {}) {
  return {
    http: {
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

export function setupLoggerMock({ error = jest.fn(), warn = jest.fn(), debug = jest.fn() } = {}) {
  return {
    error,
    warn,
    debug,
  };
}

export function setupSessionStorageFactoryMock({ asScoped = jest.fn() } = {}) {
  return {
    asScoped,
  };
}

export function setupElasticsearchMock() {
  return jest.fn();
}

export function setupPluginDependenciesMock() {
  return jest.fn();
}

export function setupHttpResponseMock({
  ok = jest.fn(),
  redirected = jest.fn(),
  unauthorized = jest.fn(),
  renderAnonymousCoreApp = jest.fn(),
  customError = jest.fn(),
  badRequest = jest.fn(),
  internalError = jest.fn(),
} = {}) {
  return {
    ok,
    redirected,
    unauthorized,
    renderAnonymousCoreApp,
    customError,
    badRequest,
    internalError,
  };
}

export function setupHttpToolkitMock({ notHandled = jest.fn(), authenticated = jest.fn() } = {}) {
  return {
    notHandled,
    authenticated,
  };
}

export function setupAuthInstanceMock({
  handleAuthenticateWithHeaders = jest.fn(),
  handleAuthenticate = jest.fn(),
  clear = jest.fn(),
} = {}) {
  return {
    handleAuthenticateWithHeaders,
    handleAuthenticate,
    clear,
  };
}

export function setupContextMock() {
  return jest.fn();
}

export function setupClusterClientMock({ asScoped = jest.fn() } = {}) {
  return {
    asScoped,
  };
}

export function setupFetchAllFromScrollMock(mockFn = jest.fn()) {
  return mockFn;
}
