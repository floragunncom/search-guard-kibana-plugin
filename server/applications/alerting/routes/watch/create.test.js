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

import { createWatch } from './create';
import { serverError } from '../../lib';
import {
  setupLoggerMock,
  setupHttpResponseMock,
  setupClusterClientMock,
  setupContextMock,
} from '../../../../utils/mocks';
import { NO_MULTITENANCY_TENANT } from '../../../../../common/alerting/constants';

describe('routes/watch/create', () => {
  test('create watch', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();

    const expectedResponse = {
      body: {
        _source: {
          trigger: {},
          checks: [],
          actions: [],
          active: true,
          log_runtime_data: false,
        },
        _id: 'id',
      },
    };

    const asCurrentUserTransportRequest = jest.fn().mockResolvedValue(expectedResponse);
    const clusterClient = setupClusterClientMock({ asCurrentUserTransportRequest });

    const request = {
      body: {
        trigger: {},
        checks: [],
        actions: [],
        active: true,
        log_runtime_data: false,
      },
      params: { id: '123 45' },
      headers: {},
    };

    const expectedClusterCallOptions = {
      method: 'put',
      path: `/_eliatra/alerting/watch/${NO_MULTITENANCY_TENANT}/${encodeURIComponent(request.params.id)}`,
      body: request.body,
    };

    await createWatch({ clusterClient, logger })(context, request, response);

    expect(clusterClient.asScoped).toHaveBeenCalledWith(request);
    expect(asCurrentUserTransportRequest).toHaveBeenLastCalledWith(expectedClusterCallOptions);
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
      body: {},
    };

    await createWatch({ clusterClient, logger })(context, request, response);

    expect(logger.error).toHaveBeenCalledWith(`createWatch: ${error.stack}`);
    expect(response.customError).toHaveBeenCalledWith(serverError(error));
  });
});
