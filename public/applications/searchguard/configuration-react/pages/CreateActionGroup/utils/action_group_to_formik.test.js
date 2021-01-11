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

import { actionGroupsToUiActionGroups, actionGroupToFormik } from './action_group_to_formik';

describe('action group to UI action group', () => {
  test('can build UI action groups', () => {
    const resource = {
      B: {},
      A: {},
      C: {},
    };

    const uiResource = [{ label: 'B' }, { label: 'C' }];

    expect(actionGroupsToUiActionGroups(resource, ['A'])).toEqual(uiResource);
  });

  test('can build UI action group', () => {
    const resource = {
      allowed_actions: ['kibana:a/b/c', 'cluster:a/b/c', 'indices:a/b/c', 'B', 'A'],
      type: 'cluster',
      hidden: false,
      reserved: false,
      static: false,
    };

    const uiResource = {
      allowed_actions: ['kibana:a/b/c', 'cluster:a/b/c', 'indices:a/b/c', 'B', 'A'],
      type: 'cluster',
      hidden: false,
      reserved: false,
      static: false,
      _isAdvanced: true,
      _name: 'A_GROUP',
      _permissions: [
        { label: 'cluster:a/b/c' },
        { label: 'indices:a/b/c' },
        { label: 'kibana:a/b/c' },
      ],
      _actiongroups: [{ label: 'A' }, { label: 'B' }],
    };

    expect(actionGroupToFormik(resource, uiResource._name)).toEqual(uiResource);
  });

  test('can build UI action group with no single permissions', () => {
    const resource = {
      allowed_actions: ['B', 'A'],
      type: 'cluster',
      hidden: false,
      reserved: false,
      static: false,
    };

    const uiResource = {
      allowed_actions: ['B', 'A'],
      type: 'cluster',
      hidden: false,
      reserved: false,
      static: false,
      _isAdvanced: false,
      _name: 'A_GROUP',
      _permissions: [],
      _actiongroups: [{ label: 'A' }, { label: 'B' }],
    };

    expect(actionGroupToFormik(resource, uiResource._name)).toEqual(uiResource);
  });
});
