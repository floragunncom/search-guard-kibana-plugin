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

import { searchEs } from './search';
import { serverError } from '../../lib';
import {
  setupLoggerMock,
  setupHttpResponseMock,
  setupClusterClientMock,
  setupContextMock,
} from '../../../../utils/mocks';

describe('routes/es/search', () => {
  test('search', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();

    const expectedResponse = {
      body: {
        hits: {
          hits: [
            { _id: '123', _source: { a: 'b' } },
            { _id: '456', _source: { c: 'd' } },
          ],
        },
      },
    };

    const asCurrentUserSearch = jest.fn().mockResolvedValue(expectedResponse);
    const clusterClient = setupClusterClientMock({ asCurrentUserSearch });

    const request = {
      body: {
        index: 'signals_main_watches',
        size: 800,
        body: {
          query: {
            match_all: {},
          },
        },
      },
      headers: {},
    };
    const expectedClusterCallOptions = request.body;

    await searchEs({ clusterClient, logger })(context, request, response);

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
      headers: {},
      params: {},
      body: {},
    };

    await searchEs({ clusterClient, logger })(context, request, response);

    expect(logger.error).toHaveBeenCalledWith(`searchEs: ${error.stack}`);
    expect(response.customError).toHaveBeenCalledWith(serverError(error));
  });
});
