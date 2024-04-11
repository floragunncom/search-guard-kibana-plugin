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

import { deleteAlert } from './delete';
import { serverError } from '../../lib';
import {
  setupLoggerMock,
  setupHttpResponseMock,
  setupClusterClientMock,
  setupContextMock,
} from '../../../../utils/mocks';
import { INDEX } from '../../../../../common/signals/constants';

describe('routes/alert/delete', () => {
  test('delete alert', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();

    const expectedResponse = { result: 'deleted' };

    const asCurrentUserDelete = jest.fn().mockResolvedValue(expectedResponse);
    const clusterClient = setupClusterClientMock({ asCurrentUserDelete });

    const request = {
      params: {
        id: '123',
        index: 'alerts',
      },
    };
    const expectedClusterCallOptions = {
      refresh: true,
      index: 'alerts',
      id: '123',
    };

    await deleteAlert({ clusterClient, logger })(context, request, response);

    expect(clusterClient.asScoped).toHaveBeenCalledWith(request);
    expect(asCurrentUserDelete).toHaveBeenCalledWith(expectedClusterCallOptions);
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

    const asCurrentUserDelete = jest.fn().mockRejectedValue(error);
    const clusterClient = setupClusterClientMock({ asCurrentUserDelete });

    const request = {
      headers: {},
      params: { id: '123' },
    };

    await deleteAlert({ clusterClient, logger })(context, request, response);

    expect(logger.error).toHaveBeenCalledWith(`deleteAlert: ${error.stack}`);
    expect(response.customError).toHaveBeenCalledWith(serverError(error));
  });
});
