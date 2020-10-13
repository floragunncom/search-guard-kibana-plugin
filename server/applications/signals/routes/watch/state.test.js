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

import { stateOfWatch } from './state';
import { serverError } from '../../lib';
import {
  setupLoggerMock,
  setupHttpResponseMock,
  setupClusterClientMock,
  setupContextMock,
} from '../../../../mocks';
import { NO_MULTITENANCY_TENANT } from '../../../../../utils/signals/constants';

describe('routes/watch/state', () => {
  test('get watch state', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();

    const expectedResponse = {
      actions: {
        my_action: {
          last_triggered: '2019-12-05T14:21:50.025735Z',
          last_triage: '2019-12-05T14:21:50.025735Z',
          last_triage_result: true,
          last_execution: '2019-12-05T14:21:50.025735Z',
          last_error: '2019-12-03T11:17:50.129348Z',
          last_status: {
            code: 'ACTION_TRIGGERED',
          },
          acked: {
            on: '2019-12-05T14:23:21.373254Z',
            by: 'test_user',
          },
          execution_count: 20,
        },
      },
      last_execution: {
        data: {
          my_data: {
            hits: {
              hits: [],
              total: {
                value: 1,
                relation: 'eq',
              },
              max_score: 1,
            },
          },
        },
        severity: {
          level: 'error',
          level_numeric: 3,
          mapping_element: {
            threshold: 1,
            level: 'error',
          },
          value: 1,
        },
        trigger: {
          scheduled_time: '2019-12-05T14:21:50Z',
          triggered_time: '2019-12-05T14:21:50.006Z',
        },
        execution_time: '2019-12-05T14:21:50.009277Z',
      },
      last_status: {
        code: 'ACTION_TRIGGERED',
      },
      node: 'my_node',
    };

    const callAsCurrentUser = jest.fn().mockResolvedValue(expectedResponse);
    const clusterClient = setupClusterClientMock({
      asScoped: jest.fn(() => ({ callAsCurrentUser })),
    });

    const request = {
      params: { id: '123' },
      headers: {},
    };

    const expectedEndpoint = 'sgSignals.stateOfWatch';
    const expectedClusterCallOptions = {
      sgtenant: NO_MULTITENANCY_TENANT,
      id: '123',
    };

    await stateOfWatch({ clusterClient, logger })(context, request, response);

    expect(clusterClient.asScoped).toHaveBeenCalledWith(request);
    expect(callAsCurrentUser).toHaveBeenCalledWith(expectedEndpoint, expectedClusterCallOptions);
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

    const callAsCurrentUser = jest.fn().mockRejectedValue(error);
    const clusterClient = setupClusterClientMock({
      asScoped: jest.fn(() => ({ callAsCurrentUser })),
    });

    const request = {
      headers: {},
      params: {},
      body: {},
    };

    await stateOfWatch({ clusterClient, logger })(context, request, response);

    expect(logger.error).toHaveBeenCalledWith(`stateOfWatch: ${error.stack}`);
    expect(response.ok).toHaveBeenCalledWith({
      body: {
        ok: false,
        resp: serverError(error),
      },
    });
  });
});
