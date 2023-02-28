/*
 * Copyright 2023 Excelerate Technology Limited T/A Eliatra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * *    Copyright 2020 floragunn GmbH
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

import { executeGraphWatch } from './execute_graph';
import { serverError } from '../../lib';
import {
  setupLoggerMock,
  setupHttpResponseMock,
  setupClusterClientMock,
  setupContextMock,
} from '../../../../utils/mocks';

describe('routes/watch/execute_graph', () => {
  test('execute graph watch', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();

    const expectedResponse = {
      body: {
        hits: {
          total: {
            value: 71,
            relation: 'eq',
          },
          max_score: null,
          hits: [],
        },
        aggregations: {
          over: {
            buckets: [
              {
                key_as_string: '2019-07-23T09:00:00.000Z',
                key: 1563872400000,
                doc_count: 9,
              },
              {
                key_as_string: '2019-07-23T10:00:00.000Z',
                key: 1563876000000,
                doc_count: 19,
              },
              {
                key_as_string: '2019-07-23T11:00:00.000Z',
                key: 1563879600000,
                doc_count: 15,
              },
            ],
          },
        },
      },
    };

    const asCurrentUserSearch = jest.fn().mockResolvedValue(expectedResponse);
    const clusterClient = setupClusterClientMock({ asCurrentUserSearch });

    const request = {
      body: {
        request: {
          indices: ['a', 'b'],
          body: {},
        },
      },
    };

    const expectedClusterCallOptions = {
      body: request.body.request.body,
      index: request.body.request.indices,
    };

    await executeGraphWatch({ clusterClient, logger })(context, request, response);

    expect(clusterClient.asScoped).toHaveBeenCalledWith(request);
    expect(asCurrentUserSearch).toHaveBeenCalledWith(expectedClusterCallOptions);
    expect(response.ok).toHaveBeenCalledWith({
      body: {
        ok: true,
        resp: expectedResponse.body,
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
      body: {
        request: {
          indices: ['a', 'b'],
          body: {},
        },
      },
    };

    await executeGraphWatch({ clusterClient, logger })(context, request, response);

    expect(logger.error).toHaveBeenCalledWith(`executeGraphWatch: ${error.stack}`);
    expect(response.customError).toHaveBeenCalledWith(serverError(error));
  });
});
