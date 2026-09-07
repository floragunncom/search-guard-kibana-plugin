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

import { SearchGuardService } from './SearchGuardService';

describe('SearchGuardService', () => {
  test('returns the Signals permission response', async () => {
    const permissions = {
      signals: true,
      tenantAccounts: { read: true, manage: false },
    };
    const httpClient = {
      post: jest.fn().mockResolvedValue({
        data: { ok: true, resp: permissions },
      }),
    };

    await expect(new SearchGuardService(httpClient).hasPermissions()).resolves.toEqual(permissions);
  });
});
