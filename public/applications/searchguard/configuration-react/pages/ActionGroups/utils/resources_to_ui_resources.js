/*
 *    Copyright 2020 floragunn GmbH
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

import { cloneDeep, map, sortBy } from 'lodash';
import { allowedActionsToPermissionsAndActiongroups } from '../../../utils/helpers';

const resourcesToUiResources = (actionGroups) => {
  return sortBy(
    map(cloneDeep(actionGroups), (values, name) => {
      const {
        actiongroups: _actiongroups,
        permissions: _permissions,
      } = allowedActionsToPermissionsAndActiongroups(values.allowed_actions);
      return {
        ...values,
        _id: name,
        _actiongroups,
        _permissions,
      };
    }),
    '_id'
  );
};

export default resourcesToUiResources;
