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

import { resourcesToUiResources } from './resources_to_ui_resources';

describe('searchguard/configuration/Blocks resourcesToUiResources', () => {
  test('can convert to UI resources', () => {
    const resources = {
      data: {
        a: {
          b: 1,
          c: 1,
        },
        d: {
          e: 2,
          f: 2,
        },
      },
    };

    const uiResources = [
      { _id: 'a', b: 1, c: 1 },
      { _id: 'd', e: 2, f: 2 },
    ];

    expect(resourcesToUiResources(resources)).toEqual(uiResources);
  });
});
