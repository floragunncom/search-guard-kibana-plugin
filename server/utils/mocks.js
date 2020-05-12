/* eslint-disable @kbn/eslint/require-license-header */
/* global jest */

export function setupSearchGuardBackendInstMock() {
  return {
    getTenantInfoWithInternalUser: jest.fn(),
  };
}

export function setupKibanaMigratorMock({ mockRunMigrations } = {}) {
  let runMigrations = jest.fn();
  if (mockRunMigrations) runMigrations = mockRunMigrations;

  return jest.fn().mockImplementation(() => {
    return {
      runMigrations,
    };
  });
}

function setupRequestMock() {
  return {
    params: {},
    payload: {},
    headers: {},
    body: {},
  };
}

function setupResponseImplementationMock({ body, statusCode, ...props }) {
  return {
    status: statusCode,
    payload: body,
    options: { body, ...props },
  };
}

function setupResponseMock({ mockOk, mockBadRequest, mockCustomError, mockInternalError } = {}) {
  const ok =
    mockOk ||
    jest.fn().mockImplementation(options => {
      return setupResponseImplementationMock({ statusCode: 200, ...options });
    });

  const badRequest =
    mockBadRequest ||
    jest.fn().mockImplementation(options => {
      return setupResponseImplementationMock({ statusCode: 400, ...options });
    });

  const customError =
    mockCustomError ||
    jest.fn().mockImplementation(options => {
      return setupResponseImplementationMock(options);
    });

  const internalError =
    mockInternalError ||
    jest.fn().mockImplementation(options => {
      return setupResponseImplementationMock({ statusCode: 500, ...options });
    });

  return {
    ok,
    badRequest,
    customError,
    internalError,
  };
}

export const httpRouteMock = {
  setupRequestMock,
  setupResponseMock,
};

function setupClusterClientScopedMock() {
  return {
    callAsInternalUser: jest.fn(),
    callAsCurrentUser: jest.fn(),
  };
}

function setupClusterClientMock() {
  return {
    callAsInternalUser: jest.fn(),
    asScoped: jest.fn().mockReturnValue(setupClusterClientScopedMock()),
  };
}

export const elasticsearchMock = {
  setupClusterClientMock,
  setupClusterClientScopedMock,
};

export function setupLoggerMock() {
  return {
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  };
}
