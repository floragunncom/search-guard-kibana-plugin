/* eslint-disable @kbn/eslint/require-license-header */
/* global jest */
export * from '../../utils/mocks';

export function setupOnTriggerErrorCalloutMock() {
  return jest.fn();
}

export function setupOnTriggerConfirmDeletionModalMock() {
  return jest.fn();
}
