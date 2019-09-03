import {
  formikToWatch,
  buildThrottle,
  getOperator,
  getResultsPath,
  getCondition,
  buildCondition,
  buildWhenAggregation,
  buildChecks,
  buildWatch,
  buildIndexAction,
  buildActions
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
  ES_QUERY_RESULT_FIELDS,
  TIMEZONE_DEFAULT
} from './constants';
import { ACTION_TYPE } from '../components/ActionPanel/utils/constants';

const esQueryResults = ES_QUERY_RESULT_FIELDS.reduce((acc, e) => {
  acc[e] = {};
  return acc;
}, {});

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
        _throttle_period: {
          interval: 1,
          unit: 's'
        },
        throttle_period: '1s',
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
        _throttle_period: {
          interval: 1,
          unit: 's'
        },
        throttle_period: '1s',
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
        _throttle_period: {
          interval: 1,
          unit: 's'
        },
        throttle_period: '1s',
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
        _throttle_period: {
          interval: 1,
          unit: 's'
        },
        throttle_period: '1s',
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
        _throttle_period: {
          interval: 1,
          unit: 's'
        },
        throttle_period: '1s',
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
        _throttle_period: {
          interval: 1,
          unit: 's'
        },
        throttle_period: '1s',
        type: ACTION_TYPE.INDEX,
        name: 'myelasticsearch',
        index: [{ label: 'a' }],
        checks: '[{ "a" }]' // JSON error
      }
    ];

    expect(buildActions(formik)).toEqual(actions);
  });
});

describe('buildWatch', () => {
  test('can build json watch', () => {
    const formik = {
      actions: [],
      active: true,
      trigger: {
        schedule: {
          cron: '0 */1 * * *',
        },
      },
      checks: JSON.stringify([{ a: 1 }]),
      ...esQueryResults,
      _meta: {
        auth_token: '123',
        last_edit: {}
      },
      ...GRAPH_DEFAULTS,
      _watchType: WATCH_TYPE.JSON,
      ...SCHEDULE_DEFAULTS,
      _frequency: 'cron',
      _cron: '0 */1 * * *',
      _ui: { ...GRAPH_DEFAULTS }
    };

    const watch = {
      actions: [],
      active: true,
      trigger: {
        schedule: {
          cron: '0 */1 * * *',
        },
      },
      checks: [{ a: 1 }],
      _meta: {
        auth_token: '123',
        last_edit: {}
      },
      _ui: {
        ...GRAPH_DEFAULTS,
        _watchType: WATCH_TYPE.JSON
      }
    };

    expect(buildWatch(formik)).toEqual(watch);
  });
});

describe('buildChecks', () => {
  test('can build checks for json watch', () => {
    const _watchType = WATCH_TYPE.JSON;
    const checks = JSON.stringify({ a: 1 });

    expect(buildChecks({ _watchType, checks })).toEqual(JSON.parse(checks));
  });

  test('can build avg() checks for graph watch', () => {
    const _bucketValue = 1;
    const _bucketUnitOfTime = 'h';
    const _timeField = 'timestamp';
    const _aggregationType = 'avg';
    const _fieldName = [{ label: 'fieldName' }];
    const _watchType = WATCH_TYPE.GRAPH;
    const _index = [{ label: 'indexName' }];
    const _thresholdValue = 1000;
    const _thresholdEnum = 'ABOVE';
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
        source: `${AGGREGATION_RESULTS_PATH} > ${_thresholdValue}`,
        type: WATCH_CHECK_TYPE.CONDITION_SCRIPT,
      }
    ];

    expect(buildChecks({
      _bucketValue,
      _bucketUnitOfTime,
      _timeField,
      _aggregationType,
      _fieldName,
      _watchType,
      _index,
      _thresholdValue,
      _thresholdEnum
    })).toEqual(result);
  });
});

describe('buildUiOverAggregation', () => {
  test('can build aggregation', () => {
    const _bucketValue = 1;
    const _bucketUnitOfTime = 'h';
    const _timeField = 'timestamp';
    const _aggregationType = 'avg';
    const _fieldName = [{ label: 'fieldName' }];
    const aggregation = {
      when: {
        avg: {
          field: 'fieldName'
        }
      }
    };

    expect(buildWhenAggregation({
      _bucketValue,
      _bucketUnitOfTime,
      _timeField,
      _aggregationType,
      _fieldName
    })).toEqual(aggregation);
  });
});

describe('buildWhenAggregation', () => {
  test('can build aggregation for count()', () => {
    const _aggregationType = 'count';
    const _fieldName = [];
    const aggregation = {};

    expect(buildWhenAggregation({ _aggregationType, _fieldName })).toEqual(aggregation);
  });

  test('can build aggregation for average()', () => {
    const _aggregationType = 'avg';
    const _fieldName = [{ label: 'fieldName' }];
    const aggregation = { when: { avg: { field: 'fieldName' } } };

    expect(buildWhenAggregation({ _aggregationType, _fieldName })).toEqual(aggregation);
  });

  test('dont build aggregation for average() if no field', () => {
    const _aggregationType = 'avg';
    const _fieldName = [];
    const aggregation = {};

    expect(buildWhenAggregation({ _aggregationType, _fieldName })).toEqual(aggregation);
  });
});

describe('buildCondition', () => {
  test('can build condition for count()', () => {
    const _thresholdValue = 1000;
    const _thresholdEnum = 'ABOVE';
    const _aggregationType = 'count';
    const condition = {
      type: WATCH_CHECK_TYPE.CONDITION_SCRIPT,
      name: WATCH_CHECK_CONDITION_NAME_DEFAULT,
      source: `${HITS_TOTAL_RESULTS_PATH} > ${_thresholdValue}`
    };

    expect(buildCondition({
      _thresholdEnum,
      _thresholdValue,
      _aggregationType
    })).toEqual(condition);
  });

  test('can build condition for average()', () => {
    const _thresholdValue = 1000;
    const _thresholdEnum = 'ABOVE';
    const _aggregationType = 'avg';
    const condition = {
      type: WATCH_CHECK_TYPE.CONDITION_SCRIPT,
      name: WATCH_CHECK_CONDITION_NAME_DEFAULT,
      source: `${AGGREGATION_RESULTS_PATH} > ${_thresholdValue}`
    };

    expect(buildCondition({
      _thresholdEnum,
      _thresholdValue,
      _aggregationType
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

describe('buildThrottle', () => {
  test('can create throttle_period from meta', () => {
    const formik = {
      _throttle_period: { interval: 12, unit: 'm' },
      throttle_period: '1s'
    };
    const watch = {
      throttle_period: '12m'
    };
    expect(buildThrottle(formik)).toEqual(watch);
  });
});

describe('formikToWatch', () => {
  describe('json watch', () => {
    test('can create watch from formik', () => {
      const formik = {
        trigger: {
          schedule: {
            interval: ['1m']
          }
        },
        checks: '[\n  {\n    "type": "search",\n    "name": "mysearch",\n    "target": "mysearch",\n    "request": {\n      "indices": [],\n      "body": {\n        "from": 0,\n        "size": 10,\n        "query": {\n          "match_all": {}\n        }\n      }\n    }\n  },\n  {\n    "type": "condition.script",\n    "name": "mycondition",\n    "source": "data.mysearch.hits.hits.length > 0"\n  }\n]',
        actions: [
          {
            _throttle_period: {
              interval: 1,
              unit: 's',
            },
            type: ACTION_TYPE.INDEX,
            name: 'myelasticsearch',
            throttle_period: '1s',
            index: [
              {
                label: 'testindex_alias'
              }
            ],
            checks: '[]'
          },
          {
            _throttle_period: {
              interval: 1,
              unit: 's',
            },
            type: ACTION_TYPE.WEBHOOK,
            name: 'mywebhook',
            throttle_period: '1s',
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
        _id: 'w1',
        ...esQueryResults,
        ...GRAPH_DEFAULTS,
        _watchType: WATCH_TYPE.JSON,
        ...SCHEDULE_DEFAULTS,
        _period: { interval: 5, unit: 'h' }
      };

      const watch = {
        _ui: {
          ...GRAPH_DEFAULTS,
          _watchType: WATCH_TYPE.JSON
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
        ]
      };

      expect(formikToWatch(formik)).toEqual(watch);
    });
  });

  describe('graph watch', () => {
    test('can create watch from formik', () => {
      const formik = {
        trigger: {
          schedule: {
            cron: ['0 */1 * * * ?']
          }
        },
        checks: '[\n  {\n    "type": "search",\n    "name": "mysearch",\n    "target": "mysearch",\n    "request": {\n      "indices": [\n        "kibana_sample_data_ecommerce",\n        "kibana_sample_data_flights"\n      ],\n      "body": {\n        "size": 0,\n        "aggregations": {},\n        "query": {\n          "bool": {\n            "filter": {\n              "range": {\n                "timestamp": {\n                  "gte": "now-1h",\n                  "lte": "now"\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  },\n  {\n    "type": "condition.script",\n    "name": "mycondition",\n    "source": "data.mysearch.hits.total.value > 1000"\n  }\n]',
        actions: [
          {
            _throttle_period: {
              interval: 1,
              unit: 's',
            },
            type: ACTION_TYPE.INDEX,
            name: 'myelasticsearch',
            throttle_period: '1s',
            index: [
              {
                label: 'testindex_alias'
              }
            ],
            checks: '[]'
          },
          {
            _throttle_period: {
              interval: 1,
              unit: 's',
            },
            type: ACTION_TYPE.WEBHOOK,
            name: 'mywebhook',
            throttle_period: '1s',
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
        _id: 'mywatch',
        ...GRAPH_DEFAULTS,
        _index: [
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
        _timeField: 'timestamp',
        ...SCHEDULE_DEFAULTS,
        _frequency: 'cron',
        _cron: '0 */1 * * * ?'
      };

      const watch = {
        _ui: {
          ...GRAPH_DEFAULTS,
          _index: [
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
          _timeField: 'timestamp'
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
        ]
      };

      expect(formikToWatch(formik)).toEqual(watch);
    });
  });
});
