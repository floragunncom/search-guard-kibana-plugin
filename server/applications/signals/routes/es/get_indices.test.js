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

import { getIndices } from './get_indices';
import { serverError } from '../../lib';
import {
  setupLoggerMock,
  setupHttpResponseMock,
  setupClusterClientMock,
  setupContextMock,
} from '../../../../utils/mocks';

describe('routes/es/get_indices', () => {
  test('get indices', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();

    const mockResponse = {
      body: {
        aggregations: {
          indices: {
            buckets: [
              {
                key: 'index_a',
                doc_count: 65494,
              },
              {
                key: 'index_b',
                doc_count: 14005,
              },
              {
                key: 'index_c',
                doc_count: 13059,
              },
            ],
          },
        },
      },
    };

    const asCurrentUserSearch = jest.fn().mockResolvedValue(mockResponse);
    const clusterClient = setupClusterClientMock({ asCurrentUserSearch });

    const request = {
      body: {
        index: '*',
      },
      headers: {},
    };

    const expectedClusterCallOptions = {
      ignoreUnavailable: true,
      index: request.body.index,
      body: {
        size: 0, // no hits
        aggs: {
          indices: {
            terms: {
              field: '_index',
              size: 800,
            },
          },
        },
      },
    };

    await getIndices({ clusterClient, logger })(context, request, response);

    const expectedResponse = [
      {
        health: 'green',
        index: 'index_a',
        status: 'open',
      },
      {
        health: 'green',
        index: 'index_b',
        status: 'open',
      },
      {
        health: 'green',
        index: 'index_c',
        status: 'open',
      },
    ];

    expect(clusterClient.asScoped).toHaveBeenCalledWith(request);
    expect(asCurrentUserSearch).toHaveBeenCalledWith(expectedClusterCallOptions);
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

    const asCurrentUserSearch = jest.fn().mockRejectedValue(error);
    const clusterClient = setupClusterClientMock({ asCurrentUserSearch });

    const request = {
      headers: {},
      params: {},
      body: {},
    };

    await getIndices({ clusterClient, logger })(context, request, response);

    expect(logger.error).toHaveBeenCalledWith(`getIndices: ${error.stack}`);
    expect(response.customError).toHaveBeenCalledWith(serverError(error));
  });
});
