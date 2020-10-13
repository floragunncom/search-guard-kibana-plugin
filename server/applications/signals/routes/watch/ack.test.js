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

import { ackWatch } from './ack';
import { serverError } from '../../lib';
import {
  setupLoggerMock,
  setupHttpResponseMock,
  setupClusterClientMock,
  setupContextMock,
} from '../../../../mocks';

describe('routes/watch/ack', () => {
  test('ack watch and action', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();

    const mockResponse = { status: 200 };

    const callAsCurrentUser = jest.fn().mockResolvedValue(mockResponse);
    const clusterClient = setupClusterClientMock({
      asScoped: jest.fn(() => ({ callAsCurrentUser })),
    });

    const inputs = [
      {
        expectedClusterCallOptions: {
          endpoint: 'sgSignals.ackWatch',
          options: { id: '123', sgtenant: '__user__' },
        },
        expectedResponse: { status: 200 },
        request: {
          headers: {
            sgtenant: '__user__',
          },
          params: { watchId: '123' },
        },
      },
      {
        expectedClusterCallOptions: {
          endpoint: 'sgSignals.ackWatchAction',
          options: { watchId: '123', actionId: '456', sgtenant: '__user__' },
        },
        expectedResponse: { status: 200 },
        request: {
          headers: {
            sgtenant: '__user__',
          },
          params: { watchId: '123', actionId: '456' },
        },
      },
    ];

    for (let i = 0; i < inputs.length; i++) {
      const { expectedClusterCallOptions, expectedResponse, request } = inputs[i];

      await ackWatch({ clusterClient, logger })(context, request, response);

      expect(clusterClient.asScoped).toHaveBeenCalledWith(request);
      expect(callAsCurrentUser).toHaveBeenCalledWith(
        expectedClusterCallOptions.endpoint,
        expectedClusterCallOptions.options
      );
      expect(response.ok).toHaveBeenCalledWith({
        body: {
          ok: true,
          resp: expectedResponse,
        },
      });
    }
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

    await ackWatch({ clusterClient, logger })(context, request, response);

    expect(logger.error).toHaveBeenCalledWith(`ackWatch: ${error.stack}`);
    expect(response.ok).toHaveBeenCalledWith({
      body: {
        ok: false,
        resp: serverError(error),
      },
    });
  });
});
