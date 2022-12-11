/*
 *    Copyright 2021 floragunn GmbH
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
/**
 *
 * @param actions
 * @param includeOnly - a filter for actions that should be considered. If empty, all actions are used.
 * @param watchActions - these are the actions as defined in the watch response. Needed for ack_enabled: false,
 * @returns {{notAcknowledgeable: {}, notAcked: {}, acked: {}}}
 */
export function groupActionsByAckState(actions, includeOnly = [], watchActions = []) {
  const actionIds = Object.keys(actions);
  const result = {
    acked: {},
    notAcked: {},
    // Not implemented yet
    notAcknowledgeable: {},
  };

  actionIds.forEach((actionId) => {
    if (includeOnly.length && includeOnly.indexOf(actionId) === -1) {
      // Ignore this action if it is not in includeOnly
      return;
    }

    const action = actions[actionId];
    const actionFromWatch = watchActions.find((watchAction) => watchAction.name === actionId);

    if (actionFromWatch && actionFromWatch.ack_enabled === false) {
      result.notAcknowledgeable[actionId] = action;
    } else if (action.acked) {
      result.acked[actionId] = action;
    } else {
      result.notAcked[actionId] = action;
    }
  });

  return result;
}
