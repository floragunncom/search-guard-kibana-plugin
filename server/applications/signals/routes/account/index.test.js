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

import { registerAccountRoutes } from '.';
import { ROUTE_PATH } from '../../../../../common/signals/constants';

const setupRouter = () => ({
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
});

describe('registerAccountRoutes', () => {
  test('always registers tenant CRUD routes for request-time gating', () => {
    const router = setupRouter();

    registerAccountRoutes({
      router,
      clusterClient: {},
      logger: {},
      configService: {},
    });

    expect(router.get).toHaveBeenCalledTimes(2);
    expect(router.put).toHaveBeenCalledTimes(2);
    expect(router.delete).toHaveBeenCalledTimes(2);
    expect(router.get.mock.calls[1][0].path).toBe(`${ROUTE_PATH.TENANT_ACCOUNT}/{type}/{id}`);
    expect(router.put.mock.calls[1][0].path).toBe(`${ROUTE_PATH.TENANT_ACCOUNT}/{type}/{id}`);
    expect(router.delete.mock.calls[1][0].path).toBe(`${ROUTE_PATH.TENANT_ACCOUNT}/{type}/{id}`);
  });
});
