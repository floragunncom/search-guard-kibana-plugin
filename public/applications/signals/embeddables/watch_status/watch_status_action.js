/*
 *    Copyright 2025 floragunn GmbH
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

import { apiCanAddNewPanel } from '@kbn/presentation-publishing';
import { IncompatibleActionError } from '@kbn/ui-actions-plugin/public';
// Kibana 9.5 no longer re-exports the trigger ids from the public entry point
import { ADD_PANEL_TRIGGER } from '@kbn/ui-actions-plugin/common/trigger_ids';
import { watchSelectorOverlay } from './watch_selector_overlay';
import {
  getStateObservables,
  WATCH_STATUS_ACTION_GROUP,
  WATCH_STATUS_ACTION_ID,
  WATCH_STATUS_EMBEDDABLE_ID,
} from './watch_status_utils';

/**
 * The "Add Signals watch" action shown in the dashboards "Add panel" flyout.
 * @param httpClient
 * @param core - core start
 */
export const createAddWatchStatusAction = ({ httpClient, core }) => ({
  id: WATCH_STATUS_ACTION_ID,
  grouping: WATCH_STATUS_ACTION_GROUP,
  getIconType: () => 'indexOpen',
  getDisplayName: () => 'Add Signals watch',
  isCompatible: async ({ embeddable }) => {
    return apiCanAddNewPanel(embeddable);
  },
  execute: async ({ embeddable }) => {
    if (!apiCanAddNewPanel(embeddable)) throw new IncompatibleActionError();

    const stateObservables = getStateObservables({
      watchId: null,
    });

    /**
     * Add panel helper function
     *
     * Use 'serializedState' (not 'initialState') since 9.1.x
     */
    const addPanel = (serializedState) => {
      embeddable.addNewPanel({
        panelType: WATCH_STATUS_EMBEDDABLE_ID,
        serializedState: serializedState,
      });
    };

    // Open flyout to select watch (non-blocking, user can add multiple panels)
    watchSelectorOverlay({
      addPanel,
      httpClient,
      stateObservables,
      core,
      api: {
        parentApi: embeddable,
      },
    });
  },
});

/**
 * Registers the add watch status action to the dashboards add panel button.
 *
 * Kibana 9.5 removed uiActions.registerAction and attachAction; actions are registered
 * lazily with addTriggerActionAsync. The default panel size lives on the embeddable
 * definition (getPlacementHints) now; the former panel placement registries are gone.
 *
 * @param uiActions - uiActions plugin per plugin dependencies (start contract)
 * @param httpClient
 * @param core - core start
 */
export const registerAddWatchStatusAction = ({ uiActions, httpClient, core }) => {
  uiActions.addTriggerActionAsync(ADD_PANEL_TRIGGER, WATCH_STATUS_ACTION_ID, async () =>
    createAddWatchStatusAction({ httpClient, core })
  );
};
