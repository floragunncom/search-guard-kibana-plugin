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

import { getAccounts } from './get';
import { serverError } from '../../lib';
import {
  setupLoggerMock,
  setupHttpResponseMock,
  setupClusterClientMock,
  setupContextMock,
} from '../../../../utils/mocks';

describe('routes/accounts/get', () => {
  test('get accounts', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();

    const firstResponse = {
      body: {
        _scroll_id: 'FGluY2x1ZGVfY',
        hits: {
          hits: [
            {
              _id: 'email/mymailserver',
              _index: '.alerting_accounts',
              _source: {
                mime_layout: 'default',
                port: 1025,
                default_subject: 'SG Alerting Message',
                host: 'localhost',
                type: 'EMAIL',
                session_timeout: 120000,
              },
            },
          ],
        },
      },
    };
    const secondResponse = [...firstResponse.body.hits.hits];

    const asCurrentUserTransportRequest = jest.fn().mockResolvedValueOnce(firstResponse);
    const fetchAllFromScroll = jest.fn().mockResolvedValue(secondResponse);
    const clusterClient = setupClusterClientMock({ asCurrentUserTransportRequest });

    const request = {
      body: { query: { match_all: {} }, scroll: '30s' },
    };

    await getAccounts({ clusterClient, fetchAllFromScroll, logger })(context, request, response);

    const expectedPath = `/_eliatra/alerting/account/_search?scroll=${request.body.scroll}`;
    const expectedFetchAllFromScrollOptions = {
      clusterClient,
      scroll: request.body.scroll,
      request,
      response: firstResponse.body,
    };
    const expectedResponse = [
      {
        _id: 'mymailserver',
        default_subject: 'SG Alerting Message',
        host: 'localhost',
        mime_layout: 'default',
        port: 1025,
        session_timeout: 120000,
        type: 'EMAIL',
      },
    ];

    expect(clusterClient.asScoped).toHaveBeenCalledWith(request);
    expect(asCurrentUserTransportRequest).toHaveBeenCalledWith({
      method: 'post',
      path: expectedPath,
      body: { query: request.body.query },
    });
    expect(fetchAllFromScroll).toHaveBeenCalledWith(expectedFetchAllFromScrollOptions);
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
    const fetchAllFromScroll = jest.fn();
    const clusterClient = setupClusterClientMock({ asCurrentUserTransportRequest });

    const request = {
      headers: {},
      body: {},
    };

    await getAccounts({ clusterClient, fetchAllFromScroll, logger })(context, request, response);

    expect(logger.error).toHaveBeenCalledWith(`getAccounts: ${error.stack}`);
    expect(response.customError).toHaveBeenCalledWith(serverError(error));
  });
});
