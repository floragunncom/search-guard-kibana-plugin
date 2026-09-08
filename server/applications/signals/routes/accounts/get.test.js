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
      _scroll_id: 'FGluY2x1ZGVfY',
      hits: {
        hits: [
          {
            _id: 'email/mymailserver',
            _index: '.signals_accounts',
            _source: {
              mime_layout: 'default',
              port: 1025,
              default_subject: 'SG Signals Message',
              host: 'localhost',
              type: 'EMAIL',
              session_timeout: 120000,
            },
          },
        ],
      },
    };
    const secondResponse = [...firstResponse.hits.hits];

    const asCurrentUserTransportRequest = jest.fn().mockResolvedValueOnce(firstResponse);
    const fetchAllFromScroll = jest.fn().mockResolvedValue(secondResponse);
    const clusterClient = setupClusterClientMock({ asCurrentUserTransportRequest });

    const request = {
      body: { query: { match_all: {} }, scroll: '30s' },
    };

    await getAccounts({ clusterClient, fetchAllFromScroll, logger })(context, request, response);

    const expectedPath = `/_signals/account/_search?scroll=${request.body.scroll}`;
    const expectedFetchAllFromScrollOptions = {
      clusterClient,
      scroll: request.body.scroll,
      request,
      response: firstResponse,
    };
    const expectedResponse = [
      {
        _id: 'mymailserver',
        default_subject: 'SG Signals Message',
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

  test('get the current tenant and global accounts', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();
    const firstResponse = { hits: { hits: [] } };
    const hits = [
      {
        _id: 'tenant 1/email/mymailserver',
        _source: { _tenant: 'tenant 1', type: 'EMAIL' },
      },
      {
        _id: 'email/globalserver',
        _source: { type: 'EMAIL' },
      },
    ];
    const asCurrentUserTransportRequest = jest.fn().mockResolvedValue(firstResponse);
    const fetchAllFromScroll = jest.fn().mockResolvedValue(hits);
    const clusterClient = setupClusterClientMock({ asCurrentUserTransportRequest });
    const configService = { get: jest.fn().mockReturnValue(true) };
    const request = {
      body: { query: {}, scroll: '30s' },
      headers: { sgtenant: 'tenant 1' },
    };

    await getAccounts({
      clusterClient,
      fetchAllFromScroll,
      logger,
      configService,
      tenantScoped: true,
    })(context, request, response);

    expect(asCurrentUserTransportRequest).toHaveBeenCalledWith({
      method: 'post',
      path: '/_signals/account/tenant%201/_search?scroll=30s',
      body: {},
    });
    expect(response.ok).toHaveBeenCalledWith({
      body: {
        ok: true,
        resp: [
          { _id: 'mymailserver', _tenant: 'tenant 1', type: 'EMAIL' },
          { _id: 'globalserver', type: 'EMAIL' },
        ],
      },
    });
  });

  test('returns not found for tenant accounts when multitenancy is disabled', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();
    const clusterClient = setupClusterClientMock();
    const fetchAllFromScroll = jest.fn();
    const configService = { get: jest.fn().mockReturnValue(false) };

    await getAccounts({
      clusterClient,
      fetchAllFromScroll,
      logger,
      configService,
      tenantScoped: true,
    })(context, {}, response);

    expect(response.notFound).toHaveBeenCalled();
    expect(clusterClient.asScoped).not.toHaveBeenCalled();
  });

  test.each([
    ['global', false],
    ['tenant', true],
  ])('logs the %s scope when there is an error', async (scope, tenantScoped) => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();

    const error = new Error('nasty!');

    const asCurrentUserTransportRequest = jest.fn().mockRejectedValue(error);
    const fetchAllFromScroll = jest.fn();
    const clusterClient = setupClusterClientMock({ asCurrentUserTransportRequest });
    const configService = { get: jest.fn().mockReturnValue(true) };

    const request = {
      headers: {},
      body: {},
    };

    await getAccounts({
      clusterClient,
      fetchAllFromScroll,
      logger,
      configService,
      tenantScoped,
    })(context, request, response);

    expect(logger.error).toHaveBeenCalledWith(`getAccounts [${scope}]: ${error.stack}`);
    expect(response.customError).toHaveBeenCalledWith(serverError(error));
  });
});
