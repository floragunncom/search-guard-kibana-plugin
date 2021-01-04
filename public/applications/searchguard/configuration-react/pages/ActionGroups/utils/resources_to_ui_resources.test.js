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

import resourcesToUiResources from './resources_to_ui_resources';

describe('action groups to UI table action groups', () => {
  test('can build UI table action groups', () => {
    const resources = {
      B_ACTION_GROUP: {
        reserved: false,
        hidden: false,
        allowed_actions: ['indices:a/b/c', 'kibana:a/b/c', 'cluster:a/b/c', 'B', 'A'],
        type: 'kibana',
        static: false,
      },
      A_ACTION_GROUP: {
        reserved: true,
        hidden: false,
        allowed_actions: ['indices:a/b/c', 'kibana:a/b/c', 'cluster:a/b/c', 'B', 'A'],
        type: 'index',
        description: 'Statically defined',
        static: true,
      },
    };

    const uiResources = [
      {
        _id: 'A_ACTION_GROUP',
        _actiongroups: ['A', 'B'],
        _permissions: ['cluster:a/b/c', 'indices:a/b/c', 'kibana:a/b/c'],
        reserved: true,
        hidden: false,
        allowed_actions: ['indices:a/b/c', 'kibana:a/b/c', 'cluster:a/b/c', 'B', 'A'],
        type: 'index',
        description: 'Statically defined',
        static: true,
      },
      {
        _id: 'B_ACTION_GROUP',
        _actiongroups: ['A', 'B'],
        _permissions: ['cluster:a/b/c', 'indices:a/b/c', 'kibana:a/b/c'],
        reserved: false,
        hidden: false,
        allowed_actions: ['indices:a/b/c', 'kibana:a/b/c', 'cluster:a/b/c', 'B', 'A'],
        type: 'kibana',
        static: false,
      },
    ];

    expect(resourcesToUiResources(resources)).toEqual(uiResources);
  });
});
