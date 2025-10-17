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

import { apiCanAddNewPanel } from '@kbn/presentation-containers';
import { ADD_PANEL_TRIGGER, IncompatibleActionError } from '@kbn/ui-actions-plugin/public';
import { watchSelectorOverlay } from './watch_selector_overlay';
import {
  getStateObservables,
  WATCH_STATUS_ACTION_GROUP,
  WATCH_STATUS_ACTION_ID,
  WATCH_STATUS_EMBEDDABLE_ID,
} from './watch_status_utils';

/**
 * Registers the add watch status action to the dashboards add panel button
 * @param uiActions - uiActions plugin per plugin dependencies
 * @param dashboard - dashboard plugin per plugin dependencies
 * @param httpClient
 * @param core - core start
 */
export const registerAddWatchStatusAction = ({ uiActions, dashboard, httpClient, core }) => {
  uiActions.registerAction({
    id: WATCH_STATUS_ACTION_ID,
    grouping: WATCH_STATUS_ACTION_GROUP,
    getIconType: () => 'indexOpen',
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
       * Use 'serializedState' (not 'initialState') in 9.1.x
       *
       */
      const addPanel = (serializedState) => {
        embeddable.addNewPanel({
          panelType: WATCH_STATUS_EMBEDDABLE_ID,
          serializedState: serializedState,
        });
      };

      // TODO THIS is weird. If the user cancels, we don't get a response.
      await watchSelectorOverlay({
        addPanel,
        httpClient,
        stateObservables,
        core,
        api: {
          parentApi: embeddable,
        },
      });
    },
    getDisplayName: () => {
      return 'Add Signals watch';
    },
  });
  uiActions.attachAction(ADD_PANEL_TRIGGER, WATCH_STATUS_ACTION_ID);

  // Set a sensible default size for the panel
  if (dashboard) {
    dashboard.registerDashboardPanelPlacementSetting(WATCH_STATUS_EMBEDDABLE_ID, () => {
      return {
        width: 8,
        height: 8,
        //strategy: "placeAtTop",
      };
    });
  }
};
