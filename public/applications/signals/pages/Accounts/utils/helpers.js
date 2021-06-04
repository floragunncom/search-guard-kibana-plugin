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

import { get } from 'lodash';
import { APP_PATH, ACCOUNT_ACTIONS } from '../../../utils/constants';

export const buildESQuery = (query) => {
  const must = get(query, 'bool.must', []);

  if (!!must.length) {
    const index = must.findIndex((clause) => clause.simple_query_string);

    if (index !== -1) {
      query.bool.must[index].simple_query_string.fields = ['_name', 'type'];
      if (query.bool.must[index].simple_query_string.query.slice(-1) !== '*') {
        query.bool.must[index].simple_query_string.query += '*';
        query.bool.must[index].simple_query_string.analyze_wildcard = true;
      }
    }
  }

  return query;
};

export const getResourceEditUri = (id, type) =>
  `${APP_PATH.DEFINE_ACCOUNT}?id=${encodeURIComponent(id)}&accountType=${type}`;

export const getResourceReadUri = (id, type) => {
  return `${APP_PATH.DEFINE_JSON_ACCOUNT}?id=${encodeURIComponent(id)}&accountType=${type}&action=${
    ACCOUNT_ACTIONS.READ_ACCOUNT
  }`;
};
