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

/*
 * Setup test against Kibana's own mocks.
 *
 * The other unit tests mock Kibana by hand, so they can only confirm that the
 * plugin calls what we think Kibana offers. Kibana ships jest mocks generated
 * from its real setup/start contracts; a method Kibana removed is missing from
 * the mock too, and calling it fails here instead of at runtime.
 */
import { coreMock } from '@kbn/core/server/mocks';
import { createEmbeddableSetupMock } from '@kbn/embeddable-plugin/server/mocks';
import { ServerPlugin } from './serverPlugin';
import { DEFAULT_CONFIG } from './default_config';
import { WATCH_STATUS_EMBEDDABLE_ID } from '../common/signals/constants';

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('ServerPlugin against the Kibana core mocks', () => {
  let plugin;
  let core;
  let embeddable;

  beforeEach(() => {
    plugin = new ServerPlugin(coreMock.createPluginInitializerContext(DEFAULT_CONFIG.searchguard));
    core = coreMock.createSetup();
    embeddable = createEmbeddableSetupMock();

    // The sub applications talk to the Search Guard backend during setup/start; that is
    // covered by their own tests. Here only the Kibana facing part of the plugin runs.
    jest
      .spyOn(plugin.searchGuardApp, 'setup')
      .mockResolvedValue({ authManager: {}, sessionStorageFactory: {}, kerberos: null });
    jest.spyOn(plugin.multiTenancyApp, 'setup').mockResolvedValue(undefined);
    jest.spyOn(plugin.signalsApp, 'start').mockReturnValue(undefined);
    jest.spyOn(plugin.authTokensApp, 'start').mockReturnValue(undefined);
    jest.spyOn(plugin.multiTenancyApp, 'start').mockResolvedValue(undefined);
  });

  test('setup() registers the router, the capabilities switcher and the dashboard panel type', async () => {
    expect(() => plugin.setup(core, { embeddable })).not.toThrow();

    expect(core.http.createRouter).toHaveBeenCalledTimes(1);
    expect(core.capabilities.registerSwitcher).toHaveBeenCalledWith(expect.any(Function), {
      capabilityPath: '*',
    });
    expect(embeddable.registerEmbeddableServerDefinition).toHaveBeenCalledWith(
      WATCH_STATUS_EMBEDDABLE_ID,
      expect.objectContaining({ getSchema: expect.any(Function) })
    );

    // The asynchronous part of setup() reads the config through the core mocks
    // and ends with the route handler context the routes rely on.
    await flushPromises();
    expect(core.http.registerRouteHandlerContext).toHaveBeenCalledWith('searchGuard', expect.any(Function));
    expect(plugin.searchGuardApp.setup).toHaveBeenCalledWith(
      expect.objectContaining({ core, kibanaRouter: core.http.createRouter.mock.results[0].value })
    );
    expect(plugin.multiTenancyApp.setup).toHaveBeenCalledWith(expect.objectContaining({ kibanaCore: core }));
  });

  test('setup() works without the optional embeddable plugin', async () => {
    expect(() => plugin.setup(core, {})).not.toThrow();
    await flushPromises();
    expect(core.http.registerRouteHandlerContext).toHaveBeenCalledTimes(1);
  });

  test('start() passes the core start contract to the sub applications', async () => {
    plugin.setup(core, { embeddable });
    await flushPromises();

    const coreStart = coreMock.createStart();
    expect(() => plugin.start(coreStart)).not.toThrow();
    await flushPromises();

    expect(plugin.signalsApp.start).toHaveBeenCalledWith(expect.objectContaining({ core: coreStart }));
    expect(plugin.authTokensApp.start).toHaveBeenCalledWith(expect.objectContaining({ core: coreStart }));
    expect(plugin.multiTenancyApp.start).toHaveBeenCalledWith(expect.objectContaining({ core: coreStart }));
  });
});
