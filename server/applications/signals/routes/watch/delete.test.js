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

import { deleteWatch } from './delete';
import { serverError } from '../../lib';
import {
  setupLoggerMock,
  setupHttpResponseMock,
  setupClusterClientMock,
  setupContextMock,
} from '../../../../utils/mocks';
import { NO_MULTITENANCY_TENANT } from '../../../../../common/signals/constants';

describe('routes/watch/delete', () => {
  test('delete watch', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();

    const expectedResponse = {
      _index: 'signals_main_watches',
      _type: '_doc',
      _id: 'id',
      _version: 2,
      result: 'deleted',
    };

    const asCurrentUserTransportRequest = jest.fn().mockResolvedValue(expectedResponse);
    const clusterClient = setupClusterClientMock({ asCurrentUserTransportRequest });

    const request = {
      params: { id: '123 45' },
      headers: {},
    };

    const expectedClusterCallOptions = {
      method: 'delete',
      path: `/_signals/watch/${NO_MULTITENANCY_TENANT}/${encodeURIComponent(request.params.id)}`,
    };

    await deleteWatch({ clusterClient, logger })(context, request, response);

    expect(clusterClient.asScoped).toHaveBeenCalledWith(request);
    expect(asCurrentUserTransportRequest).toHaveBeenLastCalledWith(expectedClusterCallOptions);
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

    const asCurrentUserTransportRequest = jest.fn().mockRejectedValue(error);
    const clusterClient = setupClusterClientMock({ asCurrentUserTransportRequest });

    const request = {
      headers: {},
      params: {},
      body: {},
    };

    await deleteWatch({ clusterClient, logger })(context, request, response);

    expect(logger.error).toHaveBeenCalledWith(`deleteWatch: ${error.stack}`);
    expect(response.customError).toHaveBeenCalledWith(serverError(error));
  });
});
