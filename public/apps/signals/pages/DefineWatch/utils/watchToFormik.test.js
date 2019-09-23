import {
  watchToFormik,
  buildFormikThrottle,
  buildFormikIndexAction,
  buildFormikChecks,
  buildFormikChecksBlocks,
  buildFormikMeta,
  buildFormikActions
} from './watchToFormik';
import { stringifyPretty } from '../../../utils/helpers';
import {
  WATCH_TYPE,
  SCHEDULE_DEFAULTS,
  GRAPH_DEFAULTS,
  DEFAULT_WATCH,
} from './constants';
import { ACTION_TYPE } from '../components/ActionPanel/utils/constants';

describe('buildFormikActions', () => {
  test('can build email formik action', () => {
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

    expect(buildFormikActions(actions)).toEqual(formik);
  });

  test('can build slack formik action', () => {
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

    expect(buildFormikActions(actions)).toEqual(formik);
  });

  test('can build webhook formik action', () => {
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
          },
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
          headers: stringifyPretty({ 'Content-type': 'application/json' }),
        }
      }
    ];

    expect(buildFormikActions(actions)).toEqual(formik);
  });

  test('can build index formik action', () => {
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

    expect(buildFormikActions(actions)).toEqual(formik);
  });
});

describe('buildFormikMeta', () => {
  test('can create UI metadate formik from existing meta', () => {
    const watch = { _ui: { ...GRAPH_DEFAULTS } };
    const formik = { ...GRAPH_DEFAULTS };

    expect(buildFormikMeta(watch)).toEqual(formik);
  });

  test('can create UI metadate formik for a watch added via REST API', () => {
    const watch = {};
    const formik = { ...GRAPH_DEFAULTS, _watchType: WATCH_TYPE.JSON };

    expect(buildFormikMeta(watch)).toEqual(formik);
  });
});

describe('buildFormikChecks', () => {
  test('can create checks formik', () => {
    const checks = [{ name: 'mySearch', value: { a: 1 } }];

    expect(buildFormikChecks(checks)).toEqual(stringifyPretty(checks));
  });
});

describe('buildFormikChecksBlocks', () => {
  test('can create checks blocks formik', () => {
    const checks = [
      { value: { a: 1 } },
      { value: { b: 2 } },
    ];

    expect(buildFormikChecksBlocks(checks))
      .toEqual(checks.map((check, index) => ({
        index,
        check: stringifyPretty(check),
        response: '',
      })));
  });
});

describe('buildFormikIndexAction', () => {
  test('can create index action formik from index action', () => {
    const action = {
      type: WATCH_TYPE.INDEX,
      index: 'a',
      checks: [{ a: { b: 1 } }]
    };

    const formik = {
      type: WATCH_TYPE.INDEX,
      index: [{ label: 'a' }],
      checks: stringifyPretty(action.checks)
    };

    expect(buildFormikIndexAction(action)).toEqual(formik);
  });
});

describe('buildFormikThrottle', () => {
  test('can create throttle formik from throttle period', () => {
    const watch = {
      throttle_period: '12m'
    };

    const formik = {
      _throttle_period: { interval: 12, unit: 'm' },
      throttle_period: '12m'
    };

    expect(buildFormikThrottle(watch)).toEqual(formik);
  });
});

describe('watchToFormik', () => {
  describe('graph watch', () => {
    test('can create formik for new watch', () => {
      const watch = {
        _id: '',
        active: true,
        trigger: {
          schedule: {
            interval: ['5h']
          }
        },
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
        actions: [],
        _ui: { ...GRAPH_DEFAULTS }
      };

      const formik = {
        ...GRAPH_DEFAULTS,
        _ui: { ...GRAPH_DEFAULTS },
        _id: '',
        active: true,
        trigger: {
          schedule: {
            interval: ['5h']
          }
        },
        checks: stringifyPretty([
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
        ]),
        _checksBlocks: buildFormikChecksBlocks(DEFAULT_WATCH.checks),
        actions: [],
        ...SCHEDULE_DEFAULTS,
        _frequency: 'interval',
        _period: { interval: 5, unit: 'h' },
        _checksGraphResult: {}
      };

      expect(watchToFormik(watch)).toEqual(formik);
    });

    test('can create formik for existing watch', () => {
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
          _timeField: 'timestamp',
        },
        trigger: {
          schedule: {
            cron: ['* */1 * * * ?']
          }
        },
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
            name: 'mycheck',
            source: 'data.mysearch.hits.total.value > 1000'
          }
        ],
        actions: [
          {
            type: ACTION_TYPE.INDEX,
            name: 'myelasticsearch',
            throttle_period: '1s',
            index: 'testindex_alias'
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
        _id: 'mywatch'
      };

      const formik = {
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
          _timeField: 'timestamp',
        },
        trigger: {
          schedule: {
            cron: ['* */1 * * * ?']
          }
        },
        checks: stringifyPretty([
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
            name: 'mycheck',
            source: 'data.mysearch.hits.total.value > 1000'
          }
        ]),
        _checksBlocks: buildFormikChecksBlocks([
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
            name: 'mycheck',
            source: 'data.mysearch.hits.total.value > 1000'
          }
        ]),
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
              headers: stringifyPretty({ 'Content-type': 'application/json' })
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
        _cron: '* */1 * * * ?',
        _checksGraphResult: {},
      };

      expect(watchToFormik(watch)).toEqual(formik);
    });
  });

  describe('json watch', () => {
    test('can create formik for json watch', () => {
      const watch = {
        trigger: {
          schedule: {
            cron: ['* */1 * * * ?']
          }
        },
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
        actions: [
          {
            type: ACTION_TYPE.INDEX,
            name: 'myelasticsearch',
            throttle_period: '1s',
            index: 'testindex_alias'
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
        _id: 'w1'
      };

      const formik = {
        _ui: { ...GRAPH_DEFAULTS, _watchType: WATCH_TYPE.JSON },
        trigger: {
          schedule: {
            cron: ['* */1 * * * ?']
          }
        },
        checks: stringifyPretty([
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
        ]),
        _checksBlocks: buildFormikChecksBlocks(DEFAULT_WATCH.checks),
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
              headers: stringifyPretty({ 'Content-type': 'application/json' })
            }
          }
        ],
        active: true,
        log_runtime_data: false,
        _id: 'w1',
        ...GRAPH_DEFAULTS,
        _watchType: WATCH_TYPE.JSON,
        ...SCHEDULE_DEFAULTS,
        _frequency: 'cron',
        _cron: '* */1 * * * ?',
        _checksGraphResult: {},
      };

      expect(watchToFormik(watch)).toEqual(formik);
    });
  });
});
