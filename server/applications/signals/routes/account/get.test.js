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

import { getAccount } from './get';
import { serverError } from '../../lib';
import {
  setupLoggerMock,
  setupHttpResponseMock,
  setupClusterClientMock,
  setupContextMock,
} from '../../../../mocks';

describe('routes/account/get', () => {
  test('get account', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();

    const mockResponse = {
      _id: 'email/mymailserver',
      found: true,
      _version: 18,
      _seq_no: 23,
      _primary_term: 4,
      _source: {
        mime_layout: 'default',
        port: 1025,
        default_subject: 'SG Signals Message',
        host: 'localhost',
        type: 'EMAIL',
        session_timeout: 120000,
      },
    };

    const callAsCurrentUser = jest.fn().mockResolvedValue(mockResponse);
    const clusterClient = setupClusterClientMock({
      asScoped: jest.fn(() => ({ callAsCurrentUser })),
    });

    const request = {
      params: { id: 'mymailserver', type: 'email' },
    };

    const expectedEndpoint = 'sgSignals.getAccount';
    const expectedClusterCallOptions = request.params;

    await getAccount({ clusterClient, logger })(context, request, response);

    const expectedResponse = { ...mockResponse._source, _id: 'mymailserver' };

    expect(clusterClient.asScoped).toHaveBeenCalledWith(request);
    expect(callAsCurrentUser).toHaveBeenCalledWith(expectedEndpoint, expectedClusterCallOptions);
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

    const request = {
      headers: {},
      params: {},
    };

    await getAccount({ clusterClient, logger })(context, request, response);

    expect(logger.error).toHaveBeenCalledWith(`getAccount: ${error.stack}`);
    expect(response.ok).toHaveBeenCalledWith({
      body: {
        ok: false,
        resp: serverError(error),
      },
    });
  });
});
