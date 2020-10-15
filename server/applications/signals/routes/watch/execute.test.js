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

import { executeWatch } from './execute';
import { serverError } from '../../lib';
import {
  setupLoggerMock,
  setupHttpResponseMock,
  setupClusterClientMock,
  setupContextMock,
} from '../../../../mocks';
import { NO_MULTITENANCY_TENANT } from '../../../../../common/signals/constants';

describe('routes/watch/execute', () => {
  test('execute watch', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();

    const expectedResponse = {
      data: {
        mysearch: {
          _shards: {},
          hits: {
            hits: [
              { _id: '123', _source: { a: 'b' } },
              { _id: '456', _source: { c: 'd' } },
            ],
          },
        },
      },
    };

    const callAsCurrentUser = jest.fn().mockResolvedValue(expectedResponse);
    const clusterClient = setupClusterClientMock({
      asScoped: jest.fn(() => ({ callAsCurrentUser })),
    });

    const request = {
      headers: {},
      body: {
        watch: {
          trigger: {},
          checks: [],
          actions: [],
          _meta: {},
        },
      },
    };

    const expectedEndpoint = 'sgSignals.executeWatch';
    const expectedClusterCallOptions = {
      body: request.body,
      sgtenant: NO_MULTITENANCY_TENANT,
    };

    await executeWatch({ clusterClient, logger })(context, request, response);

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
      body: {},
    };

    await executeWatch({ clusterClient, logger })(context, request, response);

    expect(logger.error).toHaveBeenCalledWith(`executeWatch: ${error.stack}`);
    expect(response.ok).toHaveBeenCalledWith({
      body: {
        ok: false,
        resp: serverError(error),
      },
    });
  });
});
