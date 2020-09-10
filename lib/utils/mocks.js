export function setupConfigMock({ mockGetImplementation = () => null }) {
  return {
    get: jest.fn().mockImplementation(mockGetImplementation),
  };
}

export function setupSearchguardPluginMock({ mockGetSearcGuardBackendImplementation = () => null } = {}) {
  return {
    getSearchGuardBackend: jest.fn().mockImplementation(mockGetSearcGuardBackendImplementation),
  };
}

export function setupGetSearchGuardBackendMock({
  mockGetSamlHeaderImplementation = () => null,
  mockAuthtokenImplementation = () => null,
  mockAuthinfoImplementation = () => null,
  mockAuthenticateWithHeaderImplementation = () => null,
} = {}) {
  return jest.fn().mockImplementation(() => {
    return {
      getSamlHeader: jest.fn().mockImplementation(mockGetSamlHeaderImplementation),
      authtoken: jest.fn().mockImplementation(mockAuthtokenImplementation),
      authinfo: jest.fn().mockImplementation(mockAuthinfoImplementation),
      authenticateWithHeader: jest.fn(mockAuthenticateWithHeaderImplementation),
    };
  });
}

export function setupSgSessionStorageMock({
  mockPutStorageImplementation = () => null,
  mockGetStorageImplementation = () => null,
  mockClearStorageImplementation = () => null,
  mockClearImplementation = () => null,
  mockAuthenticateImplementation = () => null,
  mockGetAuthHeaderNameImplementation = () => null,
} = {}) {
  return {
    putStorage: jest.fn().mockImplementation(mockPutStorageImplementation),
    getStorage: jest.fn().mockImplementation(mockGetStorageImplementation),
    clearStorage: jest.fn().mockImplementation(mockClearStorageImplementation),
    clear: jest.fn().mockImplementation(mockClearImplementation),
    authenticate: jest.fn().mockImplementation(mockAuthenticateImplementation),
    getAuthHeaderName: jest.fn().mockImplementation(mockGetAuthHeaderNameImplementation),
  };
}

export function setupHapiHMock({
  mockRedirectImplementation = () => null,
  mockStateImplementation = () => null,
  mockUnstateImplementation = () => null,
} = {}) {
  return {
    redirect: jest.fn().mockImplementation(mockRedirectImplementation),
    state: jest.fn().mockImplementation(mockStateImplementation),
    unstate: jest.fn().mockImplementation(mockUnstateImplementation),
  };
}

export function setupElasticsearchPluginMock({
  mockClusterClientImplementation = () => null,
} = {}) {
  return {
    createCluster: jest.fn().mockReturnValue(mockClusterClientImplementation),
  };
}

export function setupHapiConfigMock({
  mockGetImplementation = () => null,
} = {}) {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn().mockImplementation(mockGetImplementation),
  }));
}