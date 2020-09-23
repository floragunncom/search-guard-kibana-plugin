/* eslint-disable @kbn/eslint/require-license-header */
import { getPayloadFieldsForWatchExpressions } from './getPayloadFieldsForWatchExpressions';

describe('getPayloadFieldsForWatchExpressions', () => {
  test('get the payload fields', () => {
    const input = {
      runtime_attributes: {
        watch: {
          id: '__inline_watch',
          tenant: 'admin_tenant',
        },
        data: {
          mysearch: {
            _shards: {
              total: 1,
              failed: 0,
              successful: 1,
              skipped: 0,
            },
            hits: {
              hits: [],
              total: {
                value: 19,
                relation: 'eq',
              },
              max_score: null,
            },
            took: 2,
            timed_out: false,
            aggregations: {
              metricAgg: {
                value: 603.3460163317228,
              },
            },
          },
        },
        execution_time: '2020-08-11T13:10:10.960731Z',
      },
    };

    const expected = [
      {
        label: 'number',
        options: [
          {
            label: 'data.mysearch._shards.failed',
          },
          {
            label: 'data.mysearch._shards.skipped',
          },
          {
            label: 'data.mysearch._shards.successful',
          },
          {
            label: 'data.mysearch._shards.total',
          },
          {
            label: 'data.mysearch.aggregations.metricAgg.value',
          },
          {
            label: 'data.mysearch.hits.total.value',
          },
          {
            label: 'data.mysearch.took',
          },
        ],
      },
    ];

    expect(getPayloadFieldsForWatchExpressions(input)).toEqual(expected);
  });
});
