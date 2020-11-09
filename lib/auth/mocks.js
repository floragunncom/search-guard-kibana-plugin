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
  getTenantByPreference = jest.fn(),
  authenticateWithHeader = jest.fn(),
  getTenantInfoWithInternalUser = jest.fn(),
} = {}) {
  return {
    authinfo,
    validateTenant,
    getTenantByPreference,
    authenticateWithHeader,
    getTenantInfoWithInternalUser,
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

export function setupLoggerMock({ info = jest.fn(), error = jest.fn(), warn = jest.fn() } = {}) {
  return {
    error,
    info,
    warn,
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
  notFound = jest.fn(),
  internalError = jest.fn(),
  renderAnonymousCoreApp = jest.fn(),
} = {}) {
  return {
    ok,
    redirected,
    unauthorized,
    notFound,
    internalError,
    renderAnonymousCoreApp,
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
