/*
 *   Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

/*
  * Copyright 2015-2019 _floragunn_ GmbH
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
import { aliasesToUiAliases, indicesToUiIndices } from './helpers';

describe('pages/DefineWatch/components/WatchIndex/utils/helpers', () => {
  describe('aliasesToUiAliases', () => {
    it('can convert aliases to UI aliases', () => {
      const aliases = [
        {
          alias: 'b',
          index: 'index_b'
        },
        {
          alias: 'a',
          index: 'index_a'
        },
        {
          alias: 'a',
          index: 'index_b'
        }
      ];

      const uiAliases = [
        {
          label: 'a'
        },
        {
          label: 'b'
        }
      ];

      expect(aliasesToUiAliases(aliases)).toEqual(uiAliases);
    });
  });

  describe('indicesToUiIndices', () => {
    it('can convert indices to UI indices', () => {
      const indices = [
        {
          index: 'b',
          health: 'green',
          status: 'open'
        },
        {
          index: 'a',
          health: 'yellow',
          status: 'open'
        }
      ];

      const uiIndices = [
        {
          label: 'a',
          health: 'yellow',
          status: 'open'
        },
        {
          label: 'b',
          health: 'green',
          status: 'open'
        }
      ];

      expect(indicesToUiIndices(indices)).toEqual(uiIndices);
    });
  });
});
