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
} from '../../../../utils/mocks';
import { ES_SCROLL_SETTINGS } from '../../../../../common/signals/constants';

describe('routes/alerts/get', () => {
  describe('there are some results', () => {
    let logger;
    let response;
    let context;
    let firstResponse;
    let secondResponse;
    let asCurrentUserSearch;
    let fetchAllFromScroll;
    let clusterClient;
    let expectedResponse;

    beforeEach(() => {
      logger = setupLoggerMock();
      response = setupHttpResponseMock();
      context = setupContextMock();
      firstResponse = {
        body: {
          _scroll_id: 'FGluY2x1ZGVfY',
          hits: {
            hits: [
              { _index: 'log', _id: '123', _source: { a: 'b' } },
              { _index: 'log', _id: '456', _source: { c: 'd' } },
            ],
          },
        },
      };
      secondResponse = [...firstResponse.body.hits.hits];
      asCurrentUserSearch = jest.fn().mockResolvedValueOnce(firstResponse);
      fetchAllFromScroll = jest.fn().mockResolvedValue(secondResponse);
      clusterClient = setupClusterClientMock({ asCurrentUserSearch });
      expectedResponse = [
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
    });

    test('no tenant', async () => {
      const request = {
        headers: {},
        body: {
          query: { match_all: {} },
          index: 'alerts',
          sort: 'asc',
          scroll: ES_SCROLL_SETTINGS.KEEPALIVE,
        },
      };
      const expectedCallClusterOptions = {
        body: {
          sort: 'asc',
          query: { match_all: {} },
        },
        index: 'alerts',
        scroll: ES_SCROLL_SETTINGS.KEEPALIVE,
      };

      await getAlerts({ clusterClient, fetchAllFromScroll, logger })(context, request, response);

      const expectedFetchAllFromScrollOptions = {
        clusterClient,
        scroll: request.body.scroll,
        request,
        response: firstResponse.body,
      };

      expect(clusterClient.asScoped).toHaveBeenCalledWith(request);
      expect(asCurrentUserSearch).toHaveBeenCalledWith(expectedCallClusterOptions);
      expect(fetchAllFromScroll).toHaveBeenCalledWith(expectedFetchAllFromScrollOptions);
      expect(response.ok).toHaveBeenCalledWith({
        body: {
          ok: true,
          resp: expectedResponse,
        },
      });
    });

    test('tenant', async () => {
      const request = {
        headers: { sgtenant: 'user' },
        body: {
          query: { bool: { must: [{ match_all: {} }] } },
          index: 'alerts',
          sort: 'asc',
          scroll: ES_SCROLL_SETTINGS.KEEPALIVE,
        },
      };
      const expectedCallClusterOptions = {
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
      };

      await getAlerts({ clusterClient, fetchAllFromScroll, logger })(context, request, response);

      const expectedFetchAllFromScrollOptions = {
        clusterClient,
        scroll: request.body.scroll,
        request,
        response: firstResponse.body,
      };

      expect(clusterClient.asScoped).toHaveBeenCalledWith(request);
      expect(asCurrentUserSearch).toHaveBeenCalledWith(expectedCallClusterOptions);
      expect(fetchAllFromScroll).toHaveBeenCalledWith(expectedFetchAllFromScrollOptions);
      expect(response.ok).toHaveBeenCalledWith({
        body: {
          ok: true,
          resp: expectedResponse,
        },
      });
    });

    test('global tenant', async () => {
      const request = {
        headers: { sgtenant: '' },
        body: {
          query: { bool: { must: [{ match_all: {} }] } },
          index: 'alerts',
          sort: 'asc',
          scroll: ES_SCROLL_SETTINGS.KEEPALIVE,
        },
      };
      const expectedCallClusterOptions = {
        body: {
          sort: 'asc',
          query: { bool: { must: [{ match_all: {} }] } },
        },
        index: 'alerts',
        scroll: ES_SCROLL_SETTINGS.KEEPALIVE,
        index: 'alerts',
        scroll: ES_SCROLL_SETTINGS.KEEPALIVE,
      };

      await getAlerts({ clusterClient, fetchAllFromScroll, logger })(context, request, response);

      const expectedFetchAllFromScrollOptions = {
        clusterClient,
        scroll: request.body.scroll,
        request,
        response: firstResponse.body,
      };

      expect(clusterClient.asScoped).toHaveBeenCalledWith(request);
      expect(asCurrentUserSearch).toHaveBeenCalledWith(expectedCallClusterOptions);
      expect(fetchAllFromScroll).toHaveBeenCalledWith(expectedFetchAllFromScrollOptions);
      expect(response.ok).toHaveBeenCalledWith({
        body: {
          ok: true,
          resp: expectedResponse,
        },
      });
    });
  });

  test('there is an error', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();

    const error = new Error('nasty!');

    const asCurrentUserSearch = jest.fn().mockRejectedValue(error);
    const fetchAllFromScroll = jest.fn();
    const clusterClient = setupClusterClientMock({ asCurrentUserSearch });

    const request = {
      headers: {},
      body: {},
    };

    await getAlerts({ clusterClient, fetchAllFromScroll, logger })(context, request, response);

    expect(logger.error).toHaveBeenCalledWith(`getAlerts: ${error.stack}`);
    expect(response.customError).toHaveBeenCalledWith(serverError(error));
  });
});
