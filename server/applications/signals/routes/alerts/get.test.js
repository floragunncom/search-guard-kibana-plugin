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

import { getAlerts } from './get';
import { serverError } from '../../lib';
import {
  setupLoggerMock,
  setupHttpResponseMock,
  setupClusterClientMock,
  setupContextMock,
} from '../../../../mocks';
import { ES_SCROLL_SETTINGS } from '../../../../../common/signals/constants';

describe('routes/alerts/get', () => {
  test('there are some results', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();

    const mockResponse = [
      { _index: 'log', _id: '123', _source: { a: 'b' } },
      { _index: 'log', _id: '456', _source: { c: 'd' } },
    ];

    const callAsCurrentUser = jest.fn().mockResolvedValue(mockResponse);
    const clusterClient = setupClusterClientMock({
      asScoped: jest.fn(() => ({ callAsCurrentUser })),
    });
    const fetchAllFromScroll = jest.fn().mockResolvedValue(mockResponse);

    const expectedResponse = [
      {
        _id: '123',
        _index: 'log',
        a: 'b',
      },
      {
        _id: '456',
        _index: 'log',
        c: 'd',
      },
    ];

    const inputs = [
      {
        name: 'no tenant',
        request: {
          headers: {},
          body: {
            query: { match_all: {} },
            index: 'alerts',
            sort: 'asc',
            scroll: ES_SCROLL_SETTINGS.KEEPALIVE,
          },
        },
        expectedEndpoint: 'search',
        expectedCallClusterOptions: {
          body: {
            sort: 'asc',
            query: { match_all: {} },
          },
          index: 'alerts',
          scroll: ES_SCROLL_SETTINGS.KEEPALIVE,
        },
      },
      {
        name: 'tenant',
        request: {
          headers: { sgtenant: 'user' },
          body: {
            query: { bool: { must: [{ match_all: {} }] } },
            index: 'alerts',
            sort: 'asc',
            scroll: ES_SCROLL_SETTINGS.KEEPALIVE,
          },
        },
        expectedEndpoint: 'search',
        expectedCallClusterOptions: {
          body: {
            sort: 'asc',
            query: {
              bool: {
                must: [
                  { match_all: {} },
                  {
                    term: { 'tenant.keyword': { value: 'user' } },
                  },
                ],
              },
            },
          },
          index: 'alerts',
          scroll: ES_SCROLL_SETTINGS.KEEPALIVE,
        },
      },
      {
        name: 'global tenant',
        request: {
          headers: { sgtenant: '' },
          body: {
            query: { bool: { must: [{ match_all: {} }] } },
            index: 'alerts',
            sort: 'asc',
            scroll: ES_SCROLL_SETTINGS.KEEPALIVE,
          },
        },
        expectedEndpoint: 'search',
        expectedCallClusterOptions: {
          body: {
            sort: 'asc',
            query: { bool: { must: [{ match_all: {} }] } },
          },
          index: 'alerts',
          scroll: ES_SCROLL_SETTINGS.KEEPALIVE,
        },
      },
    ];

    for (const input of inputs) {
      const { request, expectedEndpoint, expectedCallClusterOptions } = input;

      await getAlerts({ clusterClient, fetchAllFromScroll, logger })(context, request, response);

      const expectedFetchAllFromScrollOptions = {
        clusterClient,
        scroll: request.body.scroll,
        request,
        response: mockResponse,
      };

      expect(clusterClient.asScoped).toHaveBeenCalledWith(request);
      expect(callAsCurrentUser).toHaveBeenCalledWith(expectedEndpoint, expectedCallClusterOptions);
      expect(fetchAllFromScroll).toHaveBeenCalledWith(expectedFetchAllFromScrollOptions);
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
    const fetchAllFromScroll = jest.fn();

    const request = {
      headers: {},
      body: {},
    };

    await getAlerts({ clusterClient, fetchAllFromScroll, logger })(context, request, response);

    expect(logger.error).toHaveBeenCalledWith(`getAlerts: ${error.stack}`);
    expect(response.ok).toHaveBeenCalledWith({
      body: {
        ok: false,
        resp: serverError(error),
      },
    });
  });
});
