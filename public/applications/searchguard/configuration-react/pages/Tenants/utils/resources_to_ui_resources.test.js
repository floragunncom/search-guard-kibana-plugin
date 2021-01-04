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

describe('tenants to UI table tenants', () => {
  test('can build UI table tenants', () => {
    const resources = {
      b: {
        description: 'B',
        hidden: false,
        reserved: false,
        static: false,
      },
      a: {
        description: 'A',
        hidden: false,
        reserved: false,
        static: false,
      },
    };

    const uiResources = [
      {
        _id: 'a',
        description: 'A',
        hidden: false,
        reserved: false,
        static: false,
      },
      {
        _id: 'b',
        description: 'B',
        hidden: false,
        reserved: false,
        static: false,
      },
    ];

    expect(resourcesToUiResources(resources)).toEqual(uiResources);
  });
});
