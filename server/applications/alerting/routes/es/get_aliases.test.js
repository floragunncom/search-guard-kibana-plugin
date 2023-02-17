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

import { getAliases } from './get_aliases';
import { serverError } from '../../lib';
import {
  setupLoggerMock,
  setupHttpResponseMock,
  setupClusterClientMock,
  setupContextMock,
} from '../../../../utils/mocks';

describe('routes/es/get_aliases', () => {
  test('get aliases', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();

    const mockResponse = {
      body: [
        {
          alias: 'testindex_alias',
          index: 'testindex',
        },
        {
          alias: '.kibana',
          index: '.kibana_2',
        },
      ],
    };

    const asCurrentUserCatAliases = jest.fn().mockResolvedValue(mockResponse);
    const clusterClient = setupClusterClientMock({ asCurrentUserCatAliases });

    const request = {
      body: {
        alias: '*',
      },
      headers: {},
    };

    const expectedClusterCallOptions = {
      alias: request.body.alias,
      format: 'json',
      h: 'alias,index',
    };

    await getAliases({ clusterClient, logger })(context, request, response);

    const expectedResponse = [
      {
        alias: 'testindex_alias',
        index: 'testindex',
      },
      {
        alias: '.kibana',
        index: '.kibana_2',
      },
    ];

    expect(clusterClient.asScoped).toHaveBeenCalledWith(request);
    expect(asCurrentUserCatAliases).toHaveBeenCalledWith(expectedClusterCallOptions);
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

    const asCurrentUserCatAliases = jest.fn().mockRejectedValue(error);
    const clusterClient = setupClusterClientMock({ asCurrentUserCatAliases });

    const request = {
      headers: {},
      params: {},
      body: {},
    };

    await getAliases({ clusterClient, logger })(context, request, response);

    expect(logger.error).toHaveBeenCalledWith(`getAliases: ${error.stack}`);
    expect(response.customError).toHaveBeenCalledWith(serverError(error));
  });
});
