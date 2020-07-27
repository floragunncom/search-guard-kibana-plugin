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

const wait = (wrapper, predicate, timeout = 10) => {
  return new Promise((resolve, reject) => {
    if (predicate(wrapper)) {
      return resolve(true);
    }
    setTimeout(() => {
      wrapper.update();
      return predicate(wrapper) ? resolve(true) : reject(new Error('Timeout expired'));
    }, timeout);
  });
};

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

    expect(addButton.exists()).toBe(true);
  });

  test('creates user', async () => {
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

    // addButton.simulate('click');
    addButton.props().onClick();
    // await wait(wrapper, (w) => {
    //   console.log(w.debug());
    // });

    // console.log(wrapper.debug());
    // console.log(wrapper.html());
    // const saveButtonSelector = 'button[data-test-subj="sgContentPanelSaveButton"]';
    // const saveButton = wrapper.find(saveButtonSelector);
    // console.log(saveButton.debug());
    // console.log(saveButton.html());
    // expect(saveButton.exists()).toBe(true);
    wrapper.update();
    setTimeout(() => {
      console.log(wrapper.debug());
      console.log(wrapper.html());
      const saveButtonSelector = 'button[data-test-subj="sgContentPanelSaveButton"]';
      const saveButton = wrapper.find(saveButtonSelector);
      console.log(saveButton.debug());
      console.log(saveButton.html());
      expect(saveButton.exists()).toBe(true);
    }, 0);

    // await addButton.simulate('click').then(() => {
    //   wrapper.update();
    //   const saveButtonSelector = 'button[data-test-subj="sgContentPanelSaveButton"]';
    //   const saveButton = wrapper.find(saveButtonSelector);
    //   console.log(saveButton.debug());
    //   console.log(saveButton.html());
    //   expect(saveButton.exists()).toBe(true);
    // });
  });
});
