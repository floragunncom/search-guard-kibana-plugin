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

import { createAccount } from './create';
import { serverError } from '../../lib';
import {
  setupLoggerMock,
  setupHttpResponseMock,
  setupClusterClientMock,
  setupContextMock,
} from '../../../../utils/mocks';

describe('routes/account/create', () => {
  test('create account', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();

    const expectedResponse = {
      body: {
        _id: 'mydest',
        _version: 21,
        result: 'created',
      },
    };

    const asCurrentUserTransportRequest = jest.fn().mockResolvedValue(expectedResponse);
    const clusterClient = setupClusterClientMock({ asCurrentUserTransportRequest });

    const request = {
      params: { id: 'mydest 2', type: 'email' },
    };
    const expectedPath = `/_eliatra/alerting/account/${request.params.type}/${encodeURIComponent(request.params.id)}`;
    const expectedBody = {};

    await createAccount({ clusterClient, logger })(context, request, response);

    expect(clusterClient.asScoped).toHaveBeenCalledWith(request);
    expect(asCurrentUserTransportRequest).toHaveBeenCalledWith({
      method: 'put',
      path: expectedPath,
      body: expectedBody,
    });
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

    const asCurrentUserTransportRequest = jest.fn().mockRejectedValue(error);
    const clusterClient = setupClusterClientMock({ asCurrentUserTransportRequest });

    const request = {
      headers: {},
      params: {},
    };

    await createAccount({ clusterClient, logger })(context, request, response);

    expect(logger.error).toHaveBeenCalledWith(`createAccount: ${error.stack}`);
    expect(response.customError).toHaveBeenCalledWith(serverError(error));
  });
});
