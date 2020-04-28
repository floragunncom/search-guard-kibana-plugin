/* eslint-disable @kbn/eslint/require-license-header */
/* global jest */

function setupRequestMock() {
  return {
    params: {},
    payload: {},
    headers: {},
    body: {},
  };
}

function setupResponseMock() {
  return {
    ok: jest.fn(),
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
