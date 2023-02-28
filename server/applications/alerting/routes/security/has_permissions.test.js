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

import { hasPermissions } from './has_permissions';
import { serverError } from '../../lib';
import {
  setupLoggerMock,
  setupHttpResponseMock,
  setupContextMock,
  setupeliatraSuiteBackendMock,
} from '../../../../utils/mocks';
import { PERMISSIONS_FOR_ACCESS } from '../../../../../common/alerting/constants';

describe('routes/security/has_permissions', () => {
  test('check Alerting UI app permissions to render', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();

    const inputs = [
      {
        name: 'no permission to render',
        mockResponse: {
          permissions: {
            'cluster:admin:eliatrasuite:tenant:alerting:watch/get': false,
            other_permission: false,
          },
        },
        expectedResponse: false,
      },
      {
        name: 'there is a permission to render',
        mockResponse: {
          permissions: {
            'cluster:admin:eliatrasuite:tenant:alerting:watch/get': true,
            other_permission: false,
          },
        },
        expectedResponse: true,
      },
    ];

    const request = {
      headers: { a: 'b' },
    };

    for (const { expectedResponse, mockResponse } of inputs) {
      const eliatraSuiteBackendService = setupeliatraSuiteBackendMock({
        hasPermissions: jest.fn().mockResolvedValue(mockResponse),
      });

      await hasPermissions({ eliatraSuiteBackendService, logger })(context, request, response);

      expect(eliatraSuiteBackendService.hasPermissions).toHaveBeenCalledWith(
        request.headers,
        PERMISSIONS_FOR_ACCESS
      );
      expect(response.ok).toHaveBeenCalledWith({
        body: { ok: true, resp: expectedResponse },
      });
    }
  });

  test('there is an error', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const context = setupContextMock();

    const error = new Error('nasty!');

    const eliatraSuiteBackendService = setupeliatraSuiteBackendMock({
      hasPermissions: jest.fn().mockRejectedValue(error),
    });

    const request = {
      headers: {},
      params: {},
      body: {},
    };

    await hasPermissions({ eliatraSuiteBackendService, logger })(context, request, response);

    expect(logger.error).toHaveBeenCalledWith(`hasPermissions: ${error.stack}`);
    expect(response.customError).toHaveBeenCalledWith(serverError(error));
  });
});
