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

import { getMappings } from './get_mappings';
import { serverError } from '../../lib';
import {
  setupLoggerMock,
  setupHttpResponseMock,
  setupClusterClientMock,
  setupContextMock,
} from '../../../../utils/mocks';

describe('routes/es/get_mappings', () => {
  test('get mappings', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();

    const expectedResponse = {
      body: {
        index_a: {
          mappings: {
            properties: {
              f0: { type: 'float' },
            },
          },
        },
        index_b: {
          mappings: {
            properties: {
              f1: { type: 'keyword' },
            },
          },
        },
      },
    };

    const asCurrentUserIndicesGetMapping = jest.fn().mockResolvedValue(expectedResponse);
    const clusterClient = setupClusterClientMock({ asCurrentUserIndicesGetMapping });

    const request = {
      body: {
        index: '*',
      },
      headers: {},
    };
    const expectedClusterCallOptions = request.body;

    await getMappings({ clusterClient, logger })(context, request, response);

    expect(clusterClient.asScoped).toHaveBeenCalledWith(request);
    expect(asCurrentUserIndicesGetMapping).toHaveBeenCalledWith(expectedClusterCallOptions);
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

    const asCurrentUserIndicesGetMapping = jest.fn().mockRejectedValue(error);
    const clusterClient = setupClusterClientMock({ asCurrentUserIndicesGetMapping });

    const request = {
      headers: {},
      params: {},
      body: {},
    };

    await getMappings({ clusterClient, logger })(context, request, response);

    expect(logger.error).toHaveBeenCalledWith(`getMappings: ${error.stack}`);
    expect(response.customError).toHaveBeenCalledWith(serverError(error));
  });
});
