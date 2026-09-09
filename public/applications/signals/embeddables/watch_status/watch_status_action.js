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
// Kibana 9.4+: trigger ids are no longer re-exported from '@kbn/ui-actions-plugin/public'
import { ADD_PANEL_TRIGGER } from '@kbn/ui-actions-plugin/common/trigger_ids';
import { watchSelectorOverlay } from './watch_selector_overlay';
import {
  getStateObservables,
  WATCH_STATUS_ACTION_GROUP,
  WATCH_STATUS_ACTION_ID,
  WATCH_STATUS_EMBEDDABLE_ID,
} from './watch_status_utils';

/**
 * Registers the add watch status action to the dashboards add panel button
 *
 * Kibana 9.5 removed uiActions.registerAction; actions are registered lazily with
 * addTriggerActionAsync(triggerId, actionId, getDefinition), which also attaches them.
 *
 * @param uiActions - uiActions plugin per plugin dependencies
 * @param httpClient
 * @param core - core start
 */
export const registerAddWatchStatusAction = ({ uiActions, httpClient, core }) => {
  uiActions.addTriggerActionAsync(ADD_PANEL_TRIGGER, WATCH_STATUS_ACTION_ID, async () => ({
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
       * 'serializedState' is the plain state object (Kibana 9.4+ dropped the { rawState } wrapper).
       * Panel size/placement is provided by the embeddable definition's getPlacementHints().
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
    getDisplayName: () => {
      return 'Add Signals watch';
    },
  }));
};
