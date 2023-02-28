/*
 * Copyright 2023 Excelerate Technology Limited T/A Eliatra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * *    Copyright 2020 floragunn GmbH
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

import { cloneDeep, sortBy, filter } from 'lodash';
import {
  arrayToComboBoxOptions,
  allowedActionsToPermissionsAndActiongroups,
} from '../../../utils/helpers';

export const actionGroupsToUiActionGroups = (actionGroups = {}, groupNamesToFilter = []) => {
  return arrayToComboBoxOptions(
    filter(sortBy(Object.keys(actionGroups)), (groupName) => {
      return !groupNamesToFilter.includes(groupName);
    })
  );
};

export const actionGroupToFormik = (actionGroup, id = '') => {
  const { allowed_actions: allowedActions } = cloneDeep(actionGroup);
  const { permissions, actiongroups } = allowedActionsToPermissionsAndActiongroups(allowedActions);
  return {
    ...actionGroup,
    _name: id,
    _isAdvanced: Array.isArray(permissions) && !!permissions.length,
    _permissions: arrayToComboBoxOptions(sortBy(permissions)),
    _actiongroups: arrayToComboBoxOptions(sortBy(actiongroups)),
  };
};
