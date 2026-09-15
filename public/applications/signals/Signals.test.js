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
import { renderApp } from './npstart';
import { appNaviFix } from '../../utils/appNaviFix';

jest.mock('./services', () => ({
  SearchGuardService: jest.fn(),
}));
jest.mock('./npstart', () => ({
  renderApp: jest.fn(),
}));
jest.mock('../../utils/constants', () => ({
  getSearchGuardAppCategory: jest.fn(),
}));
jest.mock('../../utils/appNaviFix', () => ({
  appNaviFix: jest.fn(),
}));

describe('Signals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('hides the app when watch access is missing', async () => {
    const permissions = {
      signals: false,
      globalAccounts: { read: false, manage: false },
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
    expect(updateApp).toHaveBeenCalledTimes(1);
    expect(updateApp.mock.calls[0][0]()).toEqual({
      visibleIn: [],
      tooltip: 'Signals disabled',
    });
    await expect(
      signals.mount({ configService: { fetchConfig: jest.fn().mockResolvedValue() } })({})
    ).resolves.toBeUndefined();
  });

  test('waits for config and permissions before rendering the app', async () => {
    let resolveConfig;
    let resolvePermissions;
    const configReady = new Promise((resolve) => {
      resolveConfig = resolve;
    });
    const permissionsReady = new Promise((resolve) => {
      resolvePermissions = resolve;
    });
    const permissions = {
      signals: true,
      globalAccounts: { read: true, manage: true },
      tenantAccounts: { read: true, manage: true },
    };
    const configService = {
      fetchConfig: jest.fn(() => configReady),
      isLoginPage: () => false,
    };
    SearchGuardService.mockImplementation(() => ({
      hasPermissions: jest.fn(() => permissionsReady),
    }));
    appNaviFix.mockReturnValue(jest.fn());

    const signals = new Signals();
    const setupPromise = signals.setup({ httpClient: {}, configService });
    const mountPromise = signals.mount({
      core: {},
      httpClient: {},
      configService,
    })({
      element: {},
      history: {},
      theme$: {},
    });

    resolvePermissions(permissions);
    await setupPromise;

    expect(renderApp).not.toHaveBeenCalled();

    resolveConfig();
    await mountPromise;

    expect(configService.fetchConfig).toHaveBeenCalledTimes(1);
    expect(renderApp).toHaveBeenCalledWith(
      expect.objectContaining({
        permissions,
      })
    );
  });
});
