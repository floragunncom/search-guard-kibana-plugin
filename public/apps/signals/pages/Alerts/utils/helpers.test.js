import { buildAlertsESQuery } from './helpers';

describe('buildAlertsESQuery', () => {
  test('can produce query to match action status and watch id using wildcard', () => {
    const input = {
      'query': {
        'bool': {
          'must': [
            {
              'simple_query_string': {
                'query': 'avg*'
              }
            },
            {
              'match': {
                'actions.status.code': {
                  'query': 'ACTION_TRIGGERED',
                  'operator': 'or'
                }
              }
            }
          ]
        }
      },
      'gte': 'now-30m',
      'lte': 'now',
      'order': 'desc'
    };

    const output = {
      'index': '.signals_log_*',
      'scroll': '25s',
      'body': {
        'size': 10,
        'sort': [
          {
            'execution_end': 'desc'
          }
        ],
        'query': {
          'bool': {
            'must': [
              {
                'simple_query_string': {
                  'query': 'avg*'
                }
              },
              {
                'match': {
                  'actions.status.code': {
                    'query': 'ACTION_TRIGGERED',
                    'operator': 'or'
                  }
                }
              },
              {
                'range': {
                  'execution_end': {
                    'gte': 'now-30m',
                    'lte': 'now'
                  }
                }
              }
            ]
          }
        }
      }
    };

    expect(buildAlertsESQuery(input)).toEqual(output);
  });

  test('can produce query to match watch status no_action or failed', () => {
    const input = {
      'query': {
        'bool': {
          'must': [
            {
              'match': {
                'status.code': {
                  'query': 'EXECUTION_FAILED NO_ACTION',
                  'operator': 'or'
                }
              }
            }
          ]
        }
      },
      'gte': 'now-30m',
      'lte': 'now',
      'order': 'desc'
    };

    const output = {
      'index': '.signals_log_*',
      'scroll': '25s',
      'body': {
        'size': 10,
        'sort': [
          {
            'execution_end': 'desc'
          }
        ],
        'query': {
          'bool': {
            'must': [
              {
                'match': {
                  'status.code': {
                    'query': 'EXECUTION_FAILED NO_ACTION',
                    'operator': 'or'
                  }
                }
              },
              {
                'range': {
                  'execution_end': {
                    'gte': 'now-30m',
                    'lte': 'now'
                  }
                }
              }
            ]
          }
        }
      }
    };

    expect(buildAlertsESQuery(input)).toEqual(output);
  });

  test('can produce query to match all alerts in a time range', () => {
    const input = {
      'query': {
        'match_all': {}
      },
      'gte': 'now-30m',
      'lte': 'now',
      'order': 'desc'
    };

    const output = {
      'index': '.signals_log_*',
      'scroll': '25s',
      'body': {
        'size': 10,
        'sort': [
          {
            'execution_end': 'desc'
          }
        ],
        'query': {
          'bool': {
            'must': [
              {
                'match_all': {}
              },
              {
                'range': {
                  'execution_end': {
                    'gte': 'now-30m',
                    'lte': 'now'
                  }
                }
              }
            ]
          }
        }
      }
    };

    expect(buildAlertsESQuery(input)).toEqual(output);
  });

  test('can produce query to get all alerts by watch id', () => {
    const input = {
      'query': {
        'match_all': {}
      },
      'gte': 'now-30m',
      'lte': 'now',
      'order': 'desc',
      'watchId': 'awatch'
    };

    const output = {
      'index': '.signals_log_*',
      'scroll': '25s',
      'body': {
        'size': 10,
        'sort': [
          {
            'execution_end': 'desc'
          }
        ],
        'query': {
          'bool': {
            'must': [
              {
                'match_all': {}
              },
              {
                'term': {
                  'watch_id.keyword': {
                    'value': 'awatch'
                  }
                }
              },
              {
                'range': {
                  'execution_end': {
                    'gte': 'now-30m',
                    'lte': 'now'
                  }
                }
              }
            ]
          }
        }
      }
    };

    expect(buildAlertsESQuery(input)).toEqual(output);
  });
});
