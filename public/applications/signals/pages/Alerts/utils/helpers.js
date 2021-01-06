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
import { DEFAULT_DATEFIELD } from '../../../utils/constants';

export const SIMPLE_QUERY_FIELDS = [
  'watch_id^3',
  'tenant',
  'status.code',
  'status.detail',
  'node',
  'actions.name',
  'actions.status.code',
  'actions.status.detail',
  'actions.error.message',
];

export const buildESQuery = ({ query, gte, lte, watchId }) => {
  if (query.match_all) {
    delete query.match_all;
    query.bool = {
      must: [{ match_all: {} }],
    };
  }

  if (watchId) {
    query.bool.must.push({
      term: {
        'watch_id.keyword': {
          value: watchId,
        },
      },
    });
  }

  query.bool.must.push({
    range: {
      [DEFAULT_DATEFIELD]: { gte, lte },
    },
  });

  const must = get(query, 'bool.must', []);

  if (!!must.length) {
    const index = must.findIndex((clause) => clause.simple_query_string);

    if (index !== -1) {
      query.bool.must[index].simple_query_string.fields = SIMPLE_QUERY_FIELDS;
      if (query.bool.must[index].simple_query_string.query.slice(-1) !== '*') {
        query.bool.must[index].simple_query_string.query += '*';
      }
    }
  }

  return query;
};
