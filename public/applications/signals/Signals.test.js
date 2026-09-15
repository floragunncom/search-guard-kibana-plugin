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

import { SearchGuardService } from './services';
import { Signals } from './Signals';

jest.mock('./services', () => ({
  SearchGuardService: jest.fn(),
}));
jest.mock('../../utils/constants', () => ({
  getSearchGuardAppCategory: jest.fn(),
}));
jest.mock('../../utils/appNaviFix', () => ({
  appNaviFix: jest.fn(),
}));

describe('Signals', () => {
  test('keeps the app visible when watch access is missing', async () => {
    const permissions = {
      signals: false,
      globalAccounts: { read: true, manage: true },
      tenantAccounts: { read: false, manage: false },
    };
    SearchGuardService.mockImplementation(() => ({
      hasPermissions: jest.fn().mockResolvedValue(permissions),
    }));

    const signals = new Signals();
    const updateApp = jest.spyOn(signals.appUpdater, 'next');

    await signals.start({
      httpClient: {},
      configService: { isLoginPage: () => false },
    });

    expect(signals.permissions).toEqual(permissions);
    expect(updateApp).not.toHaveBeenCalled();
  });
});
