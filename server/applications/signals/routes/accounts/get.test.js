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

import { getAccounts } from './get';
import { serverError } from '../../lib';
import {
  setupLoggerMock,
  setupHttpResponseMock,
  setupClusterClientMock,
  setupContextMock,
} from '../../../../mocks';

describe('routes/accounts/get', () => {
  test('get accounts', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();

    const mockResponse = [
      {
        _id: 'email/mymailserver',
        _index: '.signals_accounts',
        _source: {
          mime_layout: 'default',
          port: 1025,
          default_subject: 'SG Signals Message',
          host: 'localhost',
          type: 'EMAIL',
          session_timeout: 120000,
        },
      },
    ];

    const callAsCurrentUser = jest.fn().mockResolvedValue(mockResponse);
    const clusterClient = setupClusterClientMock({
      asScoped: jest.fn(() => ({ callAsCurrentUser })),
    });
    const fetchAllFromScroll = jest.fn().mockResolvedValue(mockResponse);

    const request = {
      body: { query: { match_all: {} }, scroll: '30s' },
    };

    const expectedEndpoint = 'sgSignals.getAccounts';
    const expectedCallClusterOptions = {
      body: { query: request.body.query },
      scroll: request.body.scroll,
    };

    await getAccounts({ clusterClient, fetchAllFromScroll, logger })(context, request, response);

    const expectedFetchAllFromScrollOptions = {
      clusterClient,
      scroll: request.body.scroll,
      request,
      response: mockResponse,
    };

    const expectedResponse = [
      {
        _id: 'mymailserver',
        default_subject: 'SG Signals Message',
        host: 'localhost',
        mime_layout: 'default',
        port: 1025,
        session_timeout: 120000,
        type: 'EMAIL',
      },
    ];

    expect(clusterClient.asScoped).toHaveBeenCalledWith(request);
    expect(callAsCurrentUser).toHaveBeenCalledWith(expectedEndpoint, expectedCallClusterOptions);
    expect(fetchAllFromScroll).toHaveBeenCalledWith(expectedFetchAllFromScrollOptions);
    expect(response.ok).toHaveBeenCalledWith({
      body: {
        ok: true,
        resp: expectedResponse,
      },
    });
  });

  test('there is an error', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();

    const error = new Error('nasty!');

    const callAsCurrentUser = jest.fn().mockRejectedValue(error);
    const clusterClient = setupClusterClientMock({
      asScoped: jest.fn(() => ({ callAsCurrentUser })),
    });
    const fetchAllFromScroll = jest.fn();

    const request = {
      headers: {},
      body: {},
    };

    await getAccounts({ clusterClient, fetchAllFromScroll, logger })(context, request, response);

    expect(logger.error).toHaveBeenCalledWith(`getAccounts: ${error.stack}`);
    expect(response.ok).toHaveBeenCalledWith({
      body: {
        ok: false,
        resp: serverError(error),
      },
    });
  });
});
