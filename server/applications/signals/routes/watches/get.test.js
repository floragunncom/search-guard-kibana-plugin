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

import { getWatches } from './get';
import { serverError } from '../../lib';
import {
  setupLoggerMock,
  setupHttpResponseMock,
  setupClusterClientMock,
  setupContextMock,
} from '../../../../mocks';
import { NO_MULTITENANCY_TENANT, ES_SCROLL_SETTINGS } from '../../../../../common/signals/constants';

describe('routes/watches/get', () => {
  test('there are some results', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();

    const mockResponse = [
      { _id: 'admin_tenant/123', _source: { a: 'b' } },
      { _id: 'admin_tenant/456', _source: { c: 'd' } },
    ];

    const callAsCurrentUser = jest.fn().mockResolvedValue(mockResponse);
    const clusterClient = setupClusterClientMock({
      asScoped: jest.fn(() => ({ callAsCurrentUser })),
    });
    const fetchAllFromScroll = jest.fn().mockResolvedValue(mockResponse);

    const request = {
      headers: {
        sgtenant: NO_MULTITENANCY_TENANT,
      },
      body: {
        query: {
          query: { match_all: {} },
        },
        scroll: ES_SCROLL_SETTINGS.KEEPALIVE,
      },
    };

    await getWatches({ clusterClient, fetchAllFromScroll, logger })(context, request, response);

    const expectedEndpoint = 'sgSignals.getWatches';
    const expectedCallClusterOptions = {
      body: { query: request.body.query },
      scroll: request.body.scroll,
      sgtenant: request.headers.sgtenant,
    };

    const expectedFetchAllFromScrollOptions = {
      clusterClient,
      scroll: request.body.scroll,
      request,
      response: mockResponse,
    };

    const expectedResponse = [
      { _id: '123', a: 'b' },
      { _id: '456', c: 'd' },
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
      headers: {
        sgtenant: NO_MULTITENANCY_TENANT,
      },
      body: {
        query: {
          query: { match_all: {} },
        },
        scroll: ES_SCROLL_SETTINGS.KEEPALIVE,
      },
    };

    await getWatches({ clusterClient, fetchAllFromScroll, logger })(context, request, response);

    expect(logger.error).toHaveBeenCalledWith(`getWatches: ${error.stack}`);
    expect(response.ok).toHaveBeenCalledWith({
      body: {
        ok: false,
        resp: serverError(error),
      },
    });
  });
});
