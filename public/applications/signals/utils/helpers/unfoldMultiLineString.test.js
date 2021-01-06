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

import { unfoldMultiLineString } from './unfoldMultiLineString';

describe('unfoldMultiLineString', () => {
  test('can unfold string', () => {
    const folded = JSON.stringify(
      [
        {
          source: '      a[\'b\'] = 0;\n      a["c"] = 1;',
        },
      ],
      null,
      2
    );

    const unfolded = `[
  {
    "source": """
      a['b'] = 0;
      a["c"] = 1;
"""
  }
]`;

    expect(unfoldMultiLineString(folded)).toBe(unfolded);
  });

  test('dont unfold strings with no \\n', () => {
    expect(unfoldMultiLineString('{"a": "hello world"}')).toBe('{"a": "hello world"}');
  });
});
