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
    const main = mount(
      <InternalUsers
        httpClient={httpClientMock}
        history={historyMock}
        onTriggerErrorCallout={onTriggerErrorCalloutMock}
        onTriggerConfirmDeletionModal={onTriggerConfirmDeletionModalMock}
      />
    );

    console.log(main);
    expect(main).toEqual(1);
  });
});

/*
describe('SearchGuard Configuration App', () => {
  let httpClientMock;
  let historyMock;
  let locationMock;

  beforeEach(() => {
    httpClientMock = setupHttpClientMock();
    historyMock = setupHistoryMock();
    locationMock = setupLocationMock();
  });

  test('renders the Home page', () => {
    // //services.SystemService.loadSystemInfo = jest.fn().mockResolvedValue(null);
    // class SystemService {
    //   loadSystemInfo = jest.fn().mockResolvedValue(null);
    // }

    // services.SystemService = SystemService;
    jest.mock('../../../services/SystemService', () => {
      return jest.fn().mockImplementation(() => {
        return {
          loadSystemInfo: jest.fn().mockResolvedValue(null),
          getSystemInfo: jest.fn().mockResolvedValue(null),
        };
      });
    });

    const main = mount(
      <Main
        title={SEARCH_GUARD_TITLE}
        httpClient={httpClientMock}
        history={historyMock}
        location={locationMock}
      />
    );
    console.log(main);
    expect(main).toEqual(1);
  });
});
*/
