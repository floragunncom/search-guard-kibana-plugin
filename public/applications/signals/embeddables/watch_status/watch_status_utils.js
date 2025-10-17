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

import { BehaviorSubject } from 'rxjs';

export const WATCH_STATUS_ACTION_ID = 'create_watch_status_action';
/**
 * This should not be changed after users may have added panels, since those would then not render anymore.
 * @type {string}
 */
export const WATCH_STATUS_EMBEDDABLE_ID = 'watch_status_embeddable';

/**
 * The grouping in the Add Panel flyout
 * @type {[{id: string, getIconType: (function(): string), getDisplayName: (function(): string), order: number}]}
 */
export const WATCH_STATUS_ACTION_GROUP = [
  {
    id: 'searchGuard',
    getIconType: () => 'documentation',
    getDisplayName: () => 'Search Guard',
    order: -10,
  },
];

/**
 * Creates observable state for the watch selector overlay
 */
export const getStateObservables = (attributes) => {
  return {
    watchId: new BehaviorSubject(attributes.watchId),
  };
};

/**
 * Serializes the watch selector state for passing to addNewPanel
 * 
 * Important: Must return { rawState: {...} } structure for 9.1.x
 * This is passed to the embeddable's buildEmbeddable as initialState.rawState
 */
export const serializeAttributes = (state) => {
  return {
    rawState: {
      watchId: state.watchId.getValue(),
    },
  };
};
