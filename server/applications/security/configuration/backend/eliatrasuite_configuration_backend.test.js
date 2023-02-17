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

import EliatraSuiteConfigurationBackend from './eliatrasuite_configuration_backend';
import { setupClusterClientMock, setupConfigMock } from '../../../../utils/mocks';

describe('EliatraSuiteConfigurationBackend', () => {
  let configService;

  beforeEach(() => {
    configService = setupConfigMock();
  });

  test('client encodes URI if it is not encoded', async () => {
    const asCurrentUserTransportRequest = jest.fn().mockResolvedValue({});
    const opensearch = { client: setupClusterClientMock({ asCurrentUserTransportRequest }) };
    const getOpensearch = jest.fn().mockResolvedValue(opensearch);

    const backend = new EliatraSuiteConfigurationBackend({ configService, getOpensearch });
    backend._client = jest.fn().mockResolvedValue({});

    const resourceName = 'resourceName';
    const id = 'a b';
    const expectedId = 'a%20b';

    await backend.get({}, resourceName, id);
    expect(backend._client).toHaveBeenCalledWith({
      headers: {},
      method: 'get',
      path: `/_eliatra/security/api/${resourceName}/${expectedId}`,
    });

    const body = {};
    await backend.save({}, resourceName, id, body);
    expect(backend._client).toHaveBeenCalledWith({
      headers: {},
      method: 'put',
      path: `/_eliatra/security/api/${resourceName}/${expectedId}`,
      body: {},
    });

    await backend.delete({}, resourceName, id);
    expect(backend._client).toHaveBeenCalledWith({
      headers: {},
      method: 'get',
      path: `/_eliatra/security/api/${resourceName}/${expectedId}`,
    });
  });
});
