/*
 *    Copyright 2026 floragunn GmbH
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

import { getProxies, getProxiesRoute } from './get';
import { serverError } from '../../lib';
import {
  setupLoggerMock,
  setupHttpResponseMock,
  setupClusterClientMock,
  setupContextMock,
} from '../../../../utils/mocks';
import { ROUTE_PATH } from '../../../../../common/signals/constants';

describe('routes/proxies/get', () => {
  test('registers GET route', () => {
    const router = { get: jest.fn() };

    getProxiesRoute({ router, clusterClient: {}, logger: {} });

    expect(router.get).toHaveBeenCalledTimes(1);
    expect(router.get.mock.calls[0][0].path).toBe(ROUTE_PATH.PROXIES);
  });

  test('get proxies', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();

    const proxies = [
      { id: 'smops-proxy-connector', name: 'SMOPS proxy', uri: 'http://proxy.example.com:3128' },
    ];
    const asCurrentUserTransportRequest = jest
      .fn()
      .mockResolvedValue({ status: 200, data: proxies });
    const clusterClient = setupClusterClientMock({ asCurrentUserTransportRequest });
    const request = { headers: {} };

    await getProxies({ clusterClient, logger })(context, request, response);

    expect(clusterClient.asScoped).toHaveBeenCalledWith(request);
    expect(asCurrentUserTransportRequest).toHaveBeenCalledWith({
      method: 'get',
      path: '/_signals/proxies',
    });
    expect(response.ok).toHaveBeenCalledWith({ body: { ok: true, resp: proxies } });
  });

  test('there is an error', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();

    const error = new Error('no permissions for [cluster:admin:searchguard:signals:proxies/findall]');
    error.statusCode = 403;

    const asCurrentUserTransportRequest = jest.fn().mockRejectedValue(error);
    const clusterClient = setupClusterClientMock({ asCurrentUserTransportRequest });

    await getProxies({ clusterClient, logger })(context, { headers: {} }, response);

    expect(logger.error).toHaveBeenCalledWith(`getProxies: ${error.stack}`);
    expect(response.customError).toHaveBeenCalledWith(serverError(error));
    expect(serverError(error).statusCode).toBe(403);
  });
});
