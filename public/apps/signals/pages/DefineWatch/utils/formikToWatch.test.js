import {
  formikToWatch,
  getOperator,
  getResultsPath,
  getCondition,
  buildCondition,
  buildWhenAggregation,
  buildChecks,
  buildActions,
  buildChecksFromChecksBlocks
} from './formikToWatch';
import { stringifyPretty } from '../../../utils/helpers';
import {
  WATCH_CHECK_TYPE,
  HITS_TOTAL_RESULTS_PATH,
  AGGREGATION_RESULTS_PATH,
  WATCH_CHECK_CONDITION_NAME_DEFAULT,
  WATCH_TYPE,
  WATCH_CHECK_SEARCH_NAME_DEFAULT,
  SCHEDULE_DEFAULTS,
  GRAPH_DEFAULTS,
  TIMEZONE_DEFAULT,
  RESULT_FIELD_DEFAULTS,
} from './constants';
import { ACTION_TYPE } from '../components/ActionPanel/utils/constants';

describe('buildChecksFromChecksBlocks', () => {
  test('can build checks', () => {
    const checksBlocks = [
      {
        check: JSON.stringify({ a: 1 }),
        id: 0
      },
      {
        check: JSON.stringify({ b: 1 }),
        id: 1
      }
    ];

    const checks = [
      { a: 1 },
      { b: 1 }
    ];

    expect(buildChecksFromChecksBlocks(checksBlocks)).toEqual(checks);
  });

  test('throws error if check syntax is invalid', () => {
    try {
      const checksBlocks = [
        {
          check: '{ a: }',
          id: 0
        },
        {
          check: JSON.stringify({ b: 1 }),
          id: 1
        }
      ];

      buildChecksFromChecksBlocks(checksBlocks);
    } catch (error) {
      expect(error.message).toBe('Invalid checks syntax!');
    }
  });
});

describe('buildActions', () => {
  test('can build email action', () => {
    const actions = [
      {
        throttle_period: '1s',
        type: ACTION_TYPE.EMAIL,
        name: 'myemail',
        from: 'signals@localhost',
        to: ['a', 'b'],
        cc: ['a', 'b'],
        bcc: ['a', 'b'],
        subject: 'a',
        text_body: 'Total: {{data.mysearch.hits.total.value}}',
        account: 'a'
      }
    ];

    const formik = [
      {
        throttle_period: {
          interval: 1,
          unit: 's'
        },
        type: ACTION_TYPE.EMAIL,
        name: 'myemail',
        from: 'signals@localhost',
        to: [{ label: 'a' }, { label: 'b' }],
        cc: [{ label: 'a' }, { label: 'b' }],
        bcc: [{ label: 'a' }, { label: 'b' }],
        subject: 'a',
        text_body: 'Total: {{data.mysearch.hits.total.value}}',
        account: [{ label: 'a' }]
      }
    ];

    expect(buildActions(formik)).toEqual(actions);
  });

  test('can build slack action', () => {
    const actions = [
      {
        throttle_period: '1s',
        type: ACTION_TYPE.SLACK,
        name: 'myslacksink',
        account: 'a',
        from: 'signals',
        text: 'Total: {{data.mysearch.hits.total.value}}',
        icon_emoji: ':got:'
      }
    ];

    const formik = [
      {
        throttle_period: {
          interval: 1,
          unit: 's'
        },
        type: ACTION_TYPE.SLACK,
        name: 'myslacksink',
        account: [{ label: 'a' }],
        from: 'signals',
        text: 'Total: {{data.mysearch.hits.total.value}}',
        icon_emoji: ':got:'
      }
    ];

    expect(buildActions(formik)).toEqual(actions);
  });

  test('can build webhook action', () => {
    const actions = [
      {
        throttle_period: '1s',
        type: ACTION_TYPE.WEBHOOK,
        name: 'mywebhook',
        request: {
          method: 'POST',
          url: 'http://url.com',
          body: 'Total: {{data.mysearch.hits.total.value}}',
          headers: {
            'Content-type': 'application/json'
          }
        }
      }
    ];

    const formik = [
      {
        throttle_period: {
          interval: 1,
          unit: 's'
        },
        type: ACTION_TYPE.WEBHOOK,
        name: 'mywebhook',
        request: {
          method: 'POST',
          url: 'http://url.com',
          body: 'Total: {{data.mysearch.hits.total.value}}',
          headers: stringifyPretty({ 'Content-type': 'application/json' })
        }
      }
    ];

    expect(buildActions(formik)).toEqual(actions);
  });

  test('can build webhook action if JSON error', () => {
    const actions = [
      {
        throttle_period: '1s',
        type: ACTION_TYPE.WEBHOOK,
        name: 'mywebhook',
        request: {
          method: 'POST',
          url: 'http://url.com',
          body: 'Total: {{data.mysearch.hits.total.value}}',
          headers: {}
        }
      }
    ];

    const formik = [
      {
        throttle_period: {
          interval: 1,
          unit: 's'
        },
        type: ACTION_TYPE.WEBHOOK,
        name: 'mywebhook',
        request: {
          method: 'POST',
          url: 'http://url.com',
          body: 'Total: {{data.mysearch.hits.total.value}}',
          headers: 'Content-type": "application/json" }'
        }
      }
    ];

    expect(buildActions(formik)).toEqual(actions);
  });

  test('can build index action', () => {
    const actions = [
      {
        throttle_period: '1s',
        type: ACTION_TYPE.INDEX,
        name: 'myelasticsearch',
        index: 'a',
        checks: [{ a: 1 }]
      }
    ];

    const formik = [
      {
        throttle_period: {
          interval: 1,
          unit: 's'
        },
        type: ACTION_TYPE.INDEX,
        name: 'myelasticsearch',
        index: [{ label: 'a' }],
        checks: stringifyPretty([{ a: 1 }])
      }
    ];

    expect(buildActions(formik)).toEqual(actions);
  });

  test('can build index action if JSON error', () => {
    const actions = [
      {
        throttle_period: '1s',
        type: ACTION_TYPE.INDEX,
        name: 'myelasticsearch',
        index: 'a',
        checks: []
      }
    ];

    const formik = [
      {
        throttle_period: {
          interval: 1,
          unit: 's'
        },
        type: ACTION_TYPE.INDEX,
        name: 'myelasticsearch',
        index: [{ label: 'a' }],
        checks: '[{ "a" }]' // JSON error
      }
    ];

    expect(buildActions(formik)).toEqual(actions);
  });
});

describe('buildChecks', () => {
  test('can build checks for json watch', () => {
    const watchType = WATCH_TYPE.JSON;
    const checks = JSON.stringify({ a: 1 });

    expect(buildChecks({ _ui: { watchType }, checks })).toEqual(JSON.parse(checks));
  });

  test('can build checks for blocks watch', () => {
    const watchType = WATCH_TYPE.BLOCKS;
    const checksBlocks = [{ check: JSON.stringify({ a: 1 }), id: 0 }];

    expect(buildChecks({ _ui: { watchType, checksBlocks } })).toEqual([{ a: 1 }]);
  });

  test('can build avg() checks for graph watch', () => {
    const bucketValue = 1;
    const bucketUnitOfTime = 'h';
    const timeField = 'timestamp';
    const aggregationType = 'avg';
    const fieldName = [{ label: 'fieldName' }];
    const watchType = WATCH_TYPE.GRAPH;
    const index = [{ label: 'indexName' }];
    const thresholdValue = 1000;
    const thresholdEnum = 'ABOVE';
    const result = [
      {
        name: WATCH_CHECK_SEARCH_NAME_DEFAULT,
        request: {
          body: {
            aggregations: {
              when: {
                avg: {
                  field: 'fieldName',
                },
              },
            },
            query: {
              bool: {
                filter: {
                  range: {
                    timestamp: {
                      gte: 'now-1h',
                      lte: 'now',
                    },
                  },
                },
              },
            },
            size: 0,
          },
          indices: [
            'indexName',
          ],
        },
        target: WATCH_CHECK_SEARCH_NAME_DEFAULT,
        type: WATCH_CHECK_TYPE.SEARCH,
      },
      {
        name: WATCH_CHECK_CONDITION_NAME_DEFAULT,
        source: `${AGGREGATION_RESULTS_PATH} > ${thresholdValue}`,
        type: WATCH_CHECK_TYPE.CONDITION_SCRIPT,
      }
    ];

    expect(buildChecks({
      _ui: {
        bucketValue,
        bucketUnitOfTime,
        timeField,
        aggregationType,
        fieldName,
        watchType,
        index,
        thresholdValue,
        thresholdEnum
      }
    })).toEqual(result);
  });
});

describe('buildUiOverAggregation', () => {
  test('can build aggregation', () => {
    const bucketValue = 1;
    const bucketUnitOfTime = 'h';
    const timeField = 'timestamp';
    const aggregationType = 'avg';
    const fieldName = [{ label: 'fieldName' }];
    const aggregation = {
      when: {
        avg: {
          field: 'fieldName'
        }
      }
    };

    expect(buildWhenAggregation({
      bucketValue,
      bucketUnitOfTime,
      timeField,
      aggregationType,
      fieldName
    })).toEqual(aggregation);
  });
});

describe('buildWhenAggregation', () => {
  test('can build aggregation for count()', () => {
    const aggregationType = 'count';
    const fieldName = [];
    const aggregation = {};

    expect(buildWhenAggregation({ aggregationType, fieldName })).toEqual(aggregation);
  });

  test('can build aggregation for average()', () => {
    const aggregationType = 'avg';
    const fieldName = [{ label: 'fieldName' }];
    const aggregation = { when: { avg: { field: 'fieldName' } } };

    expect(buildWhenAggregation({ aggregationType, fieldName })).toEqual(aggregation);
  });

  test('dont build aggregation for average() if no field', () => {
    const aggregationType = 'avg';
    const fieldName = [];
    const aggregation = {};

    expect(buildWhenAggregation({ aggregationType, fieldName })).toEqual(aggregation);
  });
});

describe('buildCondition', () => {
  test('can build condition for count()', () => {
    const thresholdValue = 1000;
    const thresholdEnum = 'ABOVE';
    const aggregationType = 'count';
    const condition = {
      type: WATCH_CHECK_TYPE.CONDITION_SCRIPT,
      name: WATCH_CHECK_CONDITION_NAME_DEFAULT,
      source: `${HITS_TOTAL_RESULTS_PATH} > ${thresholdValue}`
    };

    expect(buildCondition({
      thresholdEnum,
      thresholdValue,
      aggregationType
    })).toEqual(condition);
  });

  test('can build condition for average()', () => {
    const thresholdValue = 1000;
    const thresholdEnum = 'ABOVE';
    const aggregationType = 'avg';
    const condition = {
      type: WATCH_CHECK_TYPE.CONDITION_SCRIPT,
      name: WATCH_CHECK_CONDITION_NAME_DEFAULT,
      source: `${AGGREGATION_RESULTS_PATH} > ${thresholdValue}`
    };

    expect(buildCondition({
      thresholdEnum,
      thresholdValue,
      aggregationType
    })).toEqual(condition);
  });
});

describe('getCondition', () => {
  test('can get condition', () => {
    const resultsPath = AGGREGATION_RESULTS_PATH;
    const operator = '>';
    const value = 50;
    const condition = {
      type: WATCH_CHECK_TYPE.CONDITION_SCRIPT,
      name: WATCH_CHECK_CONDITION_NAME_DEFAULT,
      source: `${resultsPath} ${operator} ${value}`
    };

    expect(getCondition(resultsPath, operator, value)).toEqual(condition);
  });
});

describe('getResultsPath', () => {
  test('can get results path', () => {
    expect(getResultsPath('count')).toBe(HITS_TOTAL_RESULTS_PATH);
    expect(getResultsPath('average')).toBe(AGGREGATION_RESULTS_PATH);
  });
});

describe('getOperator', () => {
  test('can create condition operator', () => {
    expect(getOperator('ABOVE')).toBe('>');
    expect(getOperator('BELOW')).toBe('<');
    expect(getOperator('EXACTLY')).toBe('==');
  });
});

describe('formikToWatch', () => {
  describe('json watch', () => {
    test('can create watch from formik', () => {
      const formik = {
        _id: 'w1',
        _tenant: 'admin_tenant',
        _meta: {},
        _ui: {
          ...GRAPH_DEFAULTS,
          watchType: WATCH_TYPE.JSON,
          ...RESULT_FIELD_DEFAULTS,
          ...SCHEDULE_DEFAULTS,
          period: { interval: 5, unit: 'h' },
        },
        trigger: {
          schedule: {
            interval: ['1m']
          }
        },
        checks: '[\n  {\n    "type": "search",\n    "name": "mysearch",\n    "target": "mysearch",\n    "request": {\n      "indices": [],\n      "body": {\n        "from": 0,\n        "size": 10,\n        "query": {\n          "match_all": {}\n        }\n      }\n    }\n  },\n  {\n    "type": "condition.script",\n    "name": "mycondition",\n    "source": "data.mysearch.hits.hits.length > 0"\n  }\n]',
        actions: [
          {
            throttle_period: {
              interval: 1,
              unit: 's',
            },
            type: ACTION_TYPE.INDEX,
            name: 'myelasticsearch',
            index: [
              {
                label: 'testindex_alias'
              }
            ],
            checks: '[]'
          },
          {
            throttle_period: {
              interval: 1,
              unit: 's',
            },
            type: ACTION_TYPE.WEBHOOK,
            name: 'mywebhook',
            request: {
              method: 'POST',
              url: 'https://webhook.site/22092e82-bd7b-4c58-9e12-35d9d8f6a549',
              body: 'Total: {{mysearch.hits.total.value}}',
              headers: '{\n  "Content-type": "application/json"\n}'
            }
          }
        ],
        active: true,
        log_runtime_data: false,
      };

      const watch = {
        _tenant: 'admin_tenant',
        _meta: {},
        _ui: {
          ...GRAPH_DEFAULTS,
          watchType: WATCH_TYPE.JSON
        },
        trigger: {
          schedule: {
            interval: ['5h'],
            timezone: TIMEZONE_DEFAULT
          }
        },
        actions: [
          {
            type: ACTION_TYPE.INDEX,
            name: 'myelasticsearch',
            throttle_period: '1s',
            index: 'testindex_alias',
            checks: []
          },
          {
            type: ACTION_TYPE.WEBHOOK,
            name: 'mywebhook',
            throttle_period: '1s',
            request: {
              method: 'POST',
              url: 'https://webhook.site/22092e82-bd7b-4c58-9e12-35d9d8f6a549',
              body: 'Total: {{mysearch.hits.total.value}}',
              headers: {
                'Content-type': 'application/json'
              }
            }
          }
        ],
        active: true,
        log_runtime_data: false,
        checks: [
          {
            type: 'search',
            name: 'mysearch',
            target: 'mysearch',
            request: {
              indices: [],
              body: {
                from: 0,
                size: 10,
                query: {
                  match_all: {}
                }
              }
            }
          },
          {
            type: 'condition.script',
            name: 'mycondition',
            source: 'data.mysearch.hits.hits.length > 0'
          }
        ],
      };

      expect(formikToWatch(formik)).toEqual(watch);
    });
  });

  describe('graph watch', () => {
    test('can create watch from formik', () => {
      const formik = {
        _id: 'mywatch',
        _meta: {},
        _tenant: 'admin_tenant',
        _ui: {
          ...GRAPH_DEFAULTS,
          index: [
            {
              health: 'green',
              label: 'kibana_sample_data_ecommerce',
              status: 'open'
            },
            {
              health: 'green',
              label: 'kibana_sample_data_flights',
              status: 'open'
            }
          ],
          timeField: 'timestamp',
          ...SCHEDULE_DEFAULTS,
          frequency: 'cron',
          cron: '0 */1 * * * ?',
        },
        trigger: {
          schedule: {
            cron: ['0 */1 * * * ?']
          }
        },
        checks: '[\n  {\n    "type": "search",\n    "name": "mysearch",\n    "target": "mysearch",\n    "request": {\n      "indices": [\n        "kibana_sample_data_ecommerce",\n        "kibana_sample_data_flights"\n      ],\n      "body": {\n        "size": 0,\n        "aggregations": {},\n        "query": {\n          "bool": {\n            "filter": {\n              "range": {\n                "timestamp": {\n                  "gte": "now-1h",\n                  "lte": "now"\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  },\n  {\n    "type": "condition.script",\n    "name": "mycondition",\n    "source": "data.mysearch.hits.total.value > 1000"\n  }\n]',
        actions: [
          {
            throttle_period: {
              interval: 1,
              unit: 's',
            },
            type: ACTION_TYPE.INDEX,
            name: 'myelasticsearch',
            index: [
              {
                label: 'testindex_alias'
              }
            ],
            checks: '[]'
          },
          {
            throttle_period: {
              interval: 1,
              unit: 's',
            },
            type: ACTION_TYPE.WEBHOOK,
            name: 'mywebhook',
            request: {
              method: 'POST',
              url: 'https://webhook.site/22092e82-bd7b-4c58-9e12-35d9d8f6a549',
              body: 'Total: {{mysearch.hits.total.value}}',
              headers: '{\n  "Content-type": "application/json"\n}'
            }
          }
        ],
        active: true,
        log_runtime_data: false,
      };

      const watch = {
        _tenant: 'admin_tenant',
        _meta: {},
        _ui: {
          ...GRAPH_DEFAULTS,
          index: [
            {
              health: 'green',
              label: 'kibana_sample_data_ecommerce',
              status: 'open'
            },
            {
              health: 'green',
              label: 'kibana_sample_data_flights',
              status: 'open'
            }
          ],
          timeField: 'timestamp'
        },
        trigger: {
          schedule: {
            cron: ['0 */1 * * * ?'],
            timezone: TIMEZONE_DEFAULT
          }
        },
        actions: [
          {
            type: ACTION_TYPE.INDEX,
            name: 'myelasticsearch',
            throttle_period: '1s',
            index: 'testindex_alias',
            checks: []
          },
          {
            type: ACTION_TYPE.WEBHOOK,
            name: 'mywebhook',
            throttle_period: '1s',
            request: {
              method: 'POST',
              url: 'https://webhook.site/22092e82-bd7b-4c58-9e12-35d9d8f6a549',
              body: 'Total: {{mysearch.hits.total.value}}',
              headers: {
                'Content-type': 'application/json'
              }
            }
          }
        ],
        active: true,
        log_runtime_data: false,
        checks: [
          {
            type: 'search',
            name: 'mysearch',
            target: 'mysearch',
            request: {
              indices: [
                'kibana_sample_data_ecommerce',
                'kibana_sample_data_flights'
              ],
              body: {
                size: 0,
                aggregations: {},
                query: {
                  bool: {
                    filter: {
                      range: {
                        timestamp: {
                          gte: 'now-1h',
                          lte: 'now'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          {
            type: 'condition.script',
            name: 'mycondition',
            source: 'data.mysearch.hits.total.value > 1000'
          }
        ],
      };

      expect(formikToWatch(formik)).toEqual(watch);
    });
  });
});
