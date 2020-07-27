/* eslint-disable @kbn/eslint/require-license-header */
/* global jest */
import 'mutationobserver-shim';
global.MutationObserver = window.MutationObserver;

import React from 'react';
import { mount } from 'enzyme';
import InternalUsers from './InternalUsers';
import {
  setupHttpClientMock,
  setupHistoryMock,
  setupOnTriggerErrorCalloutMock,
  setupOnTriggerConfirmDeletionModalMock,
} from '../../utils/mocks';

/*
function setupLocalStorageMock() {
  return {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
  };
}

global.localStorage = setupLocalStorageMock();
*/

jest.mock('../../services', () => {
  return {
    LocalStorageService: jest.fn().mockImplementation(() => {
      return {
        get cache() {
          return jest.fn().mockImplementation(() => ({}));
        },
      };
    }),
    InternalUsersService: jest.fn().mockImplementation(() => {
      return {
        delete() {
          return jest.fn();
        },
        save() {
          return jest.fn();
        },
      };
    }),
  };
});

describe('InternalUsers', () => {
  let httpClientMock;
  let historyMock;
  let onTriggerErrorCalloutMock;
  let onTriggerConfirmDeletionModalMock;

  beforeEach(() => {
    jest.resetAllMocks();

    httpClientMock = setupHttpClientMock();
    historyMock = setupHistoryMock();
    onTriggerErrorCalloutMock = setupOnTriggerErrorCalloutMock();
    onTriggerConfirmDeletionModalMock = setupOnTriggerConfirmDeletionModalMock();
  });

  test('renders the page', () => {
    const wrapper = mount(
      <InternalUsers
        httpClient={httpClientMock}
        history={historyMock}
        onTriggerErrorCallout={onTriggerErrorCalloutMock}
        onTriggerConfirmDeletionModal={onTriggerConfirmDeletionModalMock}
      />
    );

    const addButtonSelector = 'button[data-test-subj="sgContentPanelCreateButton"]';
    const addButton = wrapper.find(addButtonSelector);
    console.log(addButton.debug());
    console.log(addButton.html());

    expect(addButton.exists()).toBe(true);
  });
});
