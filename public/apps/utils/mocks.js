/* eslint-disable @kbn/eslint/require-license-header */
/* global jest */

export function setupLocationMock() {
  return {
    pathname: '',
    search: '',
  };
}

export function setupHistoryMock() {
  return {};
}

export function setupHttpClientMock() {
  return {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  };
}
