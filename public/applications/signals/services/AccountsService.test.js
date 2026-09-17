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

import AccountsService from './AccountsService';

const response = { data: { ok: true, resp: {} } };

const setupHttpClient = () => ({
  get: jest.fn().mockResolvedValue(response),
  put: jest.fn().mockResolvedValue(response),
  post: jest.fn().mockResolvedValue(response),
  delete: jest.fn().mockResolvedValue(response),
});

describe('AccountsService', () => {
  test.each([
    [false, '../api/searchguard-signals/account', '../api/searchguard-signals/accounts'],
    [
      true,
      '../api/searchguard-signals/tenant/account',
      '../api/searchguard-signals/tenant/accounts',
    ],
  ])(
    'uses tenant-scoped routes when tenantScoped is %s',
    async (tenantScoped, accountPath, accountsPath) => {
      const httpClient = setupHttpClient();
      const service = new AccountsService(httpClient, 'email', tenantScoped);

      await service.get('my account');
      await service.put({ type: 'EMAIL' }, 'my account');
      await service.search({ match_all: {} });
      await service.delete('my account');

      expect(httpClient.get).toHaveBeenCalledWith(`${accountPath}/email/my%20account`);
      expect(httpClient.put).toHaveBeenCalledWith(`${accountPath}/email/my%20account`, {
        type: 'EMAIL',
      });
      expect(httpClient.post).toHaveBeenCalledWith(accountsPath, {
        query: { match_all: {} },
      });
      expect(httpClient.delete).toHaveBeenCalledWith(`${accountPath}/email/my%20account`);
    }
  );
});
