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

export const unfoldMultiLineString = (string = '') => {
  try {
    return string.replace(/("(?:\\"|[^"])*?")/g, (match, value) => {
      const areNewLines = /\\r|\\n/.exec(value);
      if (areNewLines) {
        return `"""\n${JSON.parse(value.replace(/^\s*\n|\s*$/g, ''))}\n"""`;
      }

      return value;
    });
  } catch (error) {
    console.error('unfoldMultiLineString -- Fail to unfold multi-line string', error);
  }

  return string;
};
