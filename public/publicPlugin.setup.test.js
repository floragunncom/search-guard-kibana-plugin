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
 * Setup test against Kibana's own mocks, see server/serverPlugin.setup.test.js.
 *
 * Kibana's browser mocks need a DOM, so public *.setup.test.js files run in the
 * jsdom project of tests/jest.config.js.
 */
import { coreMock } from '@kbn/core/public/mocks';
import { embeddablePluginMock } from '@kbn/embeddable-plugin/public/mocks';
import { uiActionsPluginMock } from '@kbn/ui-actions-plugin/public/mocks';
import { ADD_PANEL_TRIGGER } from '@kbn/ui-actions-plugin/common/trigger_ids';
import { PublicPlugin } from './publicPlugin';
import {
  WATCH_STATUS_ACTION_ID,
  WATCH_STATUS_EMBEDDABLE_ID,
} from './applications/signals/embeddables/watch_status/watch_status_utils';

describe('PublicPlugin against the Kibana core mocks', () => {
  let plugin;
  let coreSetup;
  let coreStart;
  let embeddable;
  let uiActionsSetup;
  let uiActionsStart;

  beforeEach(() => {
    plugin = new PublicPlugin(coreMock.createPluginInitializerContext());
    coreSetup = coreMock.createSetup();
    coreStart = coreMock.createStart();
    // The plugin fetches its config from the server during setup and start.
    coreSetup.http.get.mockResolvedValue({});
    coreSetup.http.post.mockResolvedValue({});
    // The Signals and auth tokens apps ask the Search Guard backend for permissions; that is
    // covered by their own tests. Here only the Kibana facing part of the plugin runs.
    jest.spyOn(plugin.signalsApp, 'setup').mockResolvedValue(undefined);
    jest.spyOn(plugin.signalsApp, 'start').mockResolvedValue(undefined);
    jest.spyOn(plugin.authTokensApp, 'start').mockReturnValue(undefined);
    embeddable = embeddablePluginMock.createSetupContract();
    uiActionsSetup = uiActionsPluginMock.createSetupContract();
    uiActionsStart = uiActionsPluginMock.createStartContract();
  });

  test('setup() registers the apps and the watch status panel type', () => {
    expect(() => plugin.setup(coreSetup, { embeddable, uiActions: uiActionsSetup })).not.toThrow();

    expect(coreSetup.http.anonymousPaths.register).toHaveBeenCalledWith('/searchguard/login');
    expect(coreSetup.application.register).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'searchguard-login' })
    );
    expect(embeddable.registerEmbeddablePublicDefinition).toHaveBeenCalledWith(
      WATCH_STATUS_EMBEDDABLE_ID,
      expect.any(Function)
    );
  });

  test('setup() works without the optional embeddable plugin', () => {
    expect(() => plugin.setup(coreSetup, { uiActions: uiActionsSetup })).not.toThrow();
  });

  test('start() registers the "Add Signals watch" dashboard action', async () => {
    // The embeddable mock wraps Kibana's real registry, which only accepts a type once per module registry.
    plugin.setup(coreSetup, { uiActions: uiActionsSetup });

    expect(() => plugin.start(coreStart, { uiActions: uiActionsStart })).not.toThrow();

    expect(uiActionsStart.addTriggerActionAsync).toHaveBeenCalledWith(
      ADD_PANEL_TRIGGER,
      WATCH_STATUS_ACTION_ID,
      expect.any(Function)
    );
    // The action definition itself has to be a valid uiActions action.
    const [, , getAction] = uiActionsStart.addTriggerActionAsync.mock.calls[0];
    const action = await getAction();
    expect(action).toEqual(
      expect.objectContaining({
        id: WATCH_STATUS_ACTION_ID,
        isCompatible: expect.any(Function),
        execute: expect.any(Function),
        getDisplayName: expect.any(Function),
      })
    );
  });
});
