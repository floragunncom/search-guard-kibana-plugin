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

import { getFieldsFromPayload } from './helpers';

describe('getFieldsFromPayload', () => {
  test('can get fields', () => {
    const payload = {
      mysearch: {
        float_num: 12.121,
        _shards: {
          total: 1,
          failed: 0,
          successful: 1,
          skipped: 0,
        },
        hits: {
          hits: [],
          total: {
            value: 65,
            relation: 'eq',
          },
          max_score: null,
        },
        took: 1,
        timed_out: false,
        aggregations: {
          bucketAgg: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 20,
            buckets: [
              {
                doc_count: 14,
                key: 'Kibana Airlines',
              },
              {
                doc_count: 15,
                key: 'JetBeats',
              },
              {
                doc_count: 16,
                key: 'Logstash Airways',
              },
            ],
          },
        },
      },
    };

    const fields = {
      'mysearch._shards.failed': 0,
      'mysearch._shards.skipped': 0,
      'mysearch._shards.successful': 1,
      'mysearch._shards.total': 1,
      'mysearch.aggregations.bucketAgg.buckets[0].doc_count': 14,
      'mysearch.aggregations.bucketAgg.buckets[0].key': 'Kibana Airlines',
      'mysearch.aggregations.bucketAgg.buckets[1].doc_count': 15,
      'mysearch.aggregations.bucketAgg.buckets[1].key': 'JetBeats',
      'mysearch.aggregations.bucketAgg.buckets[2].doc_count': 16,
      'mysearch.aggregations.bucketAgg.buckets[2].key': 'Logstash Airways',
      'mysearch.aggregations.bucketAgg.doc_count_error_upper_bound': 0,
      'mysearch.aggregations.bucketAgg.sum_other_doc_count': 20,
      'mysearch.float_num': 12.121,
      'mysearch.hits.hits': [],
      'mysearch.hits.max_score': null,
      'mysearch.hits.total.relation': 'eq',
      'mysearch.hits.total.value': 65,
      'mysearch.timed_out': false,
      'mysearch.took': 1,
    };

    expect(getFieldsFromPayload(payload)).toEqual(fields);
  });
});
