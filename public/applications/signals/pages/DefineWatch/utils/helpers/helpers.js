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

import { isNumber } from 'lodash';

export function getFieldsFromPayload(data = {}) {
  const result = {};

  function flattenJson(curr, prop = '') {
    if (typeof curr !== 'object' || !curr) {
      result[prop] = curr;
    } else if (Array.isArray(curr)) {
      if (!curr.length) result[prop] = [];
      for (let i = 0; i < curr.length; i++) {
        const childProp = `${prop}[${i}]`;
        flattenJson(curr[i], childProp);
      }
    } else if (typeof curr === 'object' && curr !== null) {
      for (const key in curr) {
        if (Object.prototype.hasOwnProperty.call(curr, key)) {
          const childProp = prop ? `${prop}.${key}` : key;
          flattenJson(curr[key], childProp);
        }
      }
    }
  }

  flattenJson(data);
  return result;
}

export function getFieldsForType(data = {}, type = 'number') {
  const res = [];

  if (type === 'number') {
    Object.keys(data).forEach((key) => {
      if (isNumber(data[key])) {
        res.push(key);
      }
    });

    return res;
  }

  return Object.keys(data);
}
