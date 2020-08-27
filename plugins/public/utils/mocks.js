/* eslint-disable @kbn/eslint/require-license-header */
/* global jest */

export function setupApiServiceMock({
  loadKibanaConfigImplementation = () => null,
  loadRestInfoImplementation = () => null,
  loadSystemInfoImplementation = () => null,
  loadAuthInfoImplementation = () => null,
} = {}) {
  return {
    loadRestInfo: jest.fn().mockImplementation(loadRestInfoImplementation),
    loadSystemInfo: jest.fn().mockImplementation(loadSystemInfoImplementation),
    loadAuthInfo: jest.fn().mockImplementation(loadAuthInfoImplementation),
    loadKibanaConfig: jest.fn().mockImplementation(loadKibanaConfigImplementation),
  };
}

export function setupCoreContextMock({ configGetImplementation = () => null } = {}) {
  return {
    config: {
      get: jest.fn().mockImplementation(configGetImplementation),
    },
  };
}

export function setupCoreMock({ uiSettingsGetImplementation = () => null } = {}) {
  return {
    uiSettings: {
      get: jest.fn().mockImplementation(uiSettingsGetImplementation),
    },
  };
}
