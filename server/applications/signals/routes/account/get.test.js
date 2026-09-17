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

import { getAccount } from './get';
import { serverError } from '../../lib';
import {
  setupLoggerMock,
  setupHttpResponseMock,
  setupClusterClientMock,
  setupContextMock,
} from '../../../../utils/mocks';

describe('routes/account/get', () => {
  test('get account', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();

    const mockResponse = {
      _id: 'email/mymailserver',
      found: true,
      _version: 18,
      _seq_no: 23,
      _primary_term: 4,
      _source: {
        mime_layout: 'default',
        port: 1025,
        default_subject: 'SG Signals Message',
        host: 'localhost',
        type: 'EMAIL',
        session_timeout: 120000,
      },
    };

    const asCurrentUserTransportRequest = jest.fn().mockResolvedValue(mockResponse);
    const clusterClient = setupClusterClientMock({ asCurrentUserTransportRequest });

    const request = {
      params: { id: 'mymailserver 2', type: 'email' },
    };

    const expectedPath = `/_signals/account/${request.params.type}/${encodeURIComponent(
      request.params.id
    )}`;
    const expectedResponse = { ...mockResponse._source, _id: 'mymailserver' };

    await getAccount({ clusterClient, logger })(context, request, response);

    expect(clusterClient.asScoped).toHaveBeenCalledWith(request);
    expect(asCurrentUserTransportRequest).toHaveBeenCalledWith({
      method: 'get',
      path: expectedPath,
    });
    expect(response.ok).toHaveBeenCalledWith({
      body: {
        ok: true,
        resp: expectedResponse,
      },
    });
  });

  test('get tenant account from the current tenant', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();
    const mockResponse = {
      _id: 'tenant 1/email/mymailserver',
      _source: {
        _tenant: 'tenant 1',
        type: 'EMAIL',
      },
    };
    const asCurrentUserTransportRequest = jest.fn().mockResolvedValue(mockResponse);
    const clusterClient = setupClusterClientMock({ asCurrentUserTransportRequest });
    const configService = { get: jest.fn().mockReturnValue(true) };
    const request = {
      headers: { sgtenant: 'tenant 1' },
      params: { id: 'mymailserver', type: 'email' },
    };

    await getAccount({ clusterClient, logger, configService, tenantScoped: true })(
      context,
      request,
      response
    );

    expect(asCurrentUserTransportRequest).toHaveBeenCalledWith({
      method: 'get',
      path: '/_signals/account/tenant%201/email/mymailserver',
    });
    expect(response.ok).toHaveBeenCalledWith({
      body: {
        ok: true,
        resp: { ...mockResponse._source, _id: 'mymailserver' },
      },
    });
  });

  test('returns not found for a tenant account when multitenancy is disabled', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();
    const clusterClient = setupClusterClientMock();
    const configService = { get: jest.fn().mockReturnValue(false) };

    await getAccount({ clusterClient, logger, configService, tenantScoped: true })(
      context,
      {},
      response
    );

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
    const clusterClient = setupClusterClientMock({ asCurrentUserTransportRequest });
    const configService = { get: jest.fn().mockReturnValue(true) };

    const request = {
      headers: {},
      params: {},
    };

    await getAccount({ clusterClient, logger, configService, tenantScoped })(
      context,
      request,
      response
    );

    expect(logger.error).toHaveBeenCalledWith(`getAccount [${scope}]: ${error.stack}`);
    expect(response.customError).toHaveBeenCalledWith(serverError(error));
  });
});
