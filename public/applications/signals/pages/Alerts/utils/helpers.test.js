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

import { buildESQuery, SIMPLE_QUERY_FIELDS } from './helpers';

describe('buildESQuery', () => {
  test('can enrich ES query', () => {
    const input = {
      query: {
        match_all: {},
      },
      gte: 'now-30m',
      lte: 'now',
      watchId: 'jirawatch',
    };

    const output = {
      bool: {
        must: [
          {
            match_all: {},
          },
          {
            term: {
              'watch_id.keyword': {
                value: 'jirawatch',
              },
            },
          },
          {
            range: {
              execution_end: {
                gte: 'now-30m',
                lte: 'now',
              },
            },
          },
        ],
      },
    };

    expect(buildESQuery(input)).toEqual(output);
  });

  test('can enrich ES query if match_all', () => {
    const input = {
      query: {
        bool: {
          must: [
            {
              simple_query_string: {
                query: 'failed',
              },
            },
          ],
        },
      },
      gte: 'now-15d',
      lte: 'now',
      watchId: 'jirawatch',
    };

    const output = {
      bool: {
        must: [
          {
            simple_query_string: {
              fields: SIMPLE_QUERY_FIELDS,
              query: 'failed*',
            },
          },
          {
            term: {
              'watch_id.keyword': {
                value: 'jirawatch',
              },
            },
          },
          {
            range: {
              execution_end: {
                gte: 'now-15d',
                lte: 'now',
              },
            },
          },
        ],
      },
    };

    expect(buildESQuery(input)).toEqual(output);
  });
});
