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

describe('auth data to UI auth', () => {
  test('can build UI auth', () => {
    const resources = {
      authc: {
        a_b: { e: 'f' },
      },
      authz: {
        c_d: { g: 'j' },
      },
    };

    const uiResources = {
      aB: {
        name: 'aB',
        resourceType: 'authc',
        e: 'f',
      },
      cD: {
        name: 'cD',
        resourceType: 'authz',
        g: 'j',
      },
    };

    expect(resourcesToUiResources(resources)).toEqual(uiResources);
  });
});
