/* eslint-disable quotes */
/* eslint-disable max-len */
import {
  formikToWatch,
  buildChecks,
  buildActions,
  buildChecksFromChecksBlocks
} from './formikToWatch';
import { stringifyPretty } from '../../../utils/helpers';
import {
  WATCH_TYPES,
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
    const watchType = WATCH_TYPES.JSON;
    const checks = JSON.stringify({ a: 1 });

    expect(buildChecks({ _ui: { watchType }, checks })).toEqual(JSON.parse(checks));
  });

  test('can build checks for blocks watch', () => {
    const watchType = WATCH_TYPES.BLOCKS;
    const checksBlocks = [{ check: JSON.stringify({ a: 1 }), id: 0 }];

    expect(buildChecks({ _ui: { watchType, checksBlocks } })).toEqual([{ a: 1 }]);
  });
});

describe('formikToWatch', () => {
  test('formik to watch: count all docs', () => {
    const formik = {
      "_id": "count all docs",
      "active": true,
      "trigger": {
        "schedule": {
          "interval": [
            "1m"
          ]
        }
      },
      "checks": "[\n  {\n    \"type\": \"search\",\n    \"name\": \"mysearch\",\n    \"target\": \"mysearch\",\n    \"request\": {\n      \"indices\": [\n        \"kibana_sample_data_flights\"\n      ],\n      \"body\": {\n        \"size\": 0,\n        \"aggregations\": {},\n        \"query\": {\n          \"bool\": {\n            \"filter\": {\n              \"range\": {\n                \"timestamp\": {\n                  \"gte\": \"now-1h\",\n                  \"lte\": \"now\"\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  },\n  {\n    \"type\": \"condition.script\",\n    \"name\": \"mycondition\",\n    \"source\": \"data.mysearch.hits.total.value > 10\"\n  }\n]",
      "actions": [
        {
          "type": "webhook",
          "name": "mywebhook",
          "throttle_period": {
            "interval": 1,
            "advInterval": "1h30m15s",
            "unit": "s"
          },
          "request": {
            "method": "POST",
            "url": "https://hooks.slack.com/services/111/111/111",
            "body": "Total: {{data.mysearch.hits.total.value}}",
            "headers": "{\n  \"Content-type\": \"application/json\"\n}"
          }
        }
      ],
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "kibana_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "count",
        "fieldName": [],
        "topHitsAgg": {
          "field": [],
          "size": 3,
          "order": "asc"
        },
        "overDocuments": "all documents",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 10,
        "thresholdEnum": "ABOVE",
        "checksGraphResult": {
          "took": 1,
          "timed_out": false,
          "_shards": {
            "total": 1,
            "successful": 1,
            "skipped": 0,
            "failed": 0
          },
          "hits": {
            "total": {
              "value": 80,
              "relation": "eq"
            },
            "max_score": null,
            "hits": []
          },
          "aggregations": {
            "dateAgg": {
              "buckets": [
                {
                  "key_as_string": "2019-11-21T08:00:00.000+01:00",
                  "key": 1574319600000,
                  "doc_count": 8
                },
                {
                  "key_as_string": "2019-11-21T09:00:00.000+01:00",
                  "key": 1574323200000,
                  "doc_count": 19
                }
              ]
            }
          }
        },
        "checksResult": {
          "mysearch": {
            "took": 1,
            "timed_out": false,
            "_shards": {
              "total": 1,
              "successful": 1,
              "skipped": 0,
              "failed": 0
            },
            "hits": {
              "total": {
                "value": 23,
                "relation": "eq"
              },
              "max_score": null,
              "hits": []
            }
          }
        },
        "checksBlocks": [
          {
            "response": "",
            "check": "{\n  \"type\": \"search\",\n  \"name\": \"mysearch\",\n  \"target\": \"mysearch\",\n  \"request\": {\n    \"indices\": [\n      \"kibana_sample_data_flights\"\n    ],\n    \"body\": {\n      \"size\": 0,\n      \"aggregations\": {},\n      \"query\": {\n        \"bool\": {\n          \"filter\": {\n            \"range\": {\n              \"timestamp\": {\n                \"gte\": \"now-1h\",\n                \"lte\": \"now\"\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}",
            "index": 0
          },
          {
            "response": "",
            "check": "{\n  \"type\": \"condition.script\",\n  \"name\": \"mycondition\",\n  \"source\": \"data.mysearch.hits.total.value > 10\"\n}",
            "index": 1
          }
        ],
        "frequency": "interval",
        "period": {
          "interval": 1,
          "advInterval": "1h30m15s",
          "unit": "m"
        },
        "cron": "0 */1 * * * ?",
        "daily": 0,
        "weekly": {
          "mon": false,
          "tue": false,
          "wed": false,
          "thu": false,
          "fri": false,
          "sat": false,
          "sun": false
        },
        "monthly": {
          "type": "day",
          "day": 1
        },
        "timezone": [
          {
            "label": "Europe/Berlin"
          }
        ]
      },
      "_meta": {
        "last_edit": {
          "user": "admin",
          "date": "2019-11-21T10:34:54.013Z"
        }
      },
      "log_runtime_data": false,
      "_tenant": "admin_tenant"
    };

    const watch = {
      "active": true,
      "trigger": {
        "schedule": {
          "interval": [
            "1m"
          ],
          "timezone": "Europe/Berlin"
        }
      },
      "checks": [
        {
          "type": "search",
          "name": "mysearch",
          "target": "mysearch",
          "request": {
            "indices": [
              "kibana_sample_data_flights"
            ],
            "body": {
              "size": 0,
              "aggregations": {},
              "query": {
                "bool": {
                  "filter": {
                    "range": {
                      "timestamp": {
                        "gte": "now-1h",
                        "lte": "now"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        {
          "type": "condition.script",
          "name": "mycondition",
          "source": "data.mysearch.hits.total.value > 10"
        }
      ],
      "actions": [
        {
          "type": "webhook",
          "name": "mywebhook",
          "request": {
            "method": "POST",
            "url": "https://hooks.slack.com/services/111/111/111",
            "body": "Total: {{data.mysearch.hits.total.value}}",
            "headers": {
              "Content-type": "application/json"
            }
          },
          "throttle_period": "1s"
        }
      ],
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "kibana_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "count",
        "fieldName": [],
        "topHitsAgg": {
          "field": [],
          "size": 3,
          "order": "asc"
        },
        "overDocuments": "all documents",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 10,
        "thresholdEnum": "ABOVE"
      },
      "_meta": {
        "last_edit": {
          "user": "admin",
          "date": "2019-11-21T10:34:54.013Z"
        }
      },
      "log_runtime_data": false,
      "_tenant": "admin_tenant"
    };

    expect(formikToWatch(formik)).toEqual(watch);
  });

  test('formik to watch: count top_hits', () => {
    const formik = {
      "_id": "count top_hits",
      "active": true,
      "trigger": {
        "schedule": {
          "interval": [
            "1m"
          ]
        }
      },
      "checks": "[\n  {\n    \"type\": \"search\",\n    \"name\": \"mysearch\",\n    \"target\": \"mysearch\",\n    \"request\": {\n      \"indices\": [\n        \"kibana_sample_data_flights\"\n      ],\n      \"body\": {\n        \"size\": 0,\n        \"aggregations\": {\n          \"bucketAgg\": {\n            \"terms\": {\n              \"field\": \"Carrier\",\n              \"size\": 3,\n              \"order\": {\n                \"_count\": \"asc\"\n              }\n            }\n          }\n        },\n        \"query\": {\n          \"bool\": {\n            \"filter\": {\n              \"range\": {\n                \"timestamp\": {\n                  \"gte\": \"now-5h\",\n                  \"lte\": \"now\"\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  },\n  {\n    \"type\": \"condition.script\",\n    \"name\": \"mycondition\",\n    \"source\": \"ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i].doc_count > 100) { return true; } } return false;\"\n  }\n]",
      "actions": [
        {
          "type": "webhook",
          "name": "mywebhook",
          "throttle_period": {
            "interval": 1,
            "advInterval": "1h30m15s",
            "unit": "s"
          },
          "request": {
            "method": "POST",
            "url": "https://hooks.slack.com/services/111/111/111",
            "body": "Total: {{data.mysearch.hits.total.value}}",
            "headers": "{\n  \"Content-type\": \"application/json\"\n}"
          }
        }
      ],
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "kibana_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "count",
        "fieldName": [],
        "topHitsAgg": {
          "field": [
            {
              "label": "Carrier"
            }
          ],
          "size": 3,
          "order": "asc"
        },
        "overDocuments": "top_hits",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 100,
        "thresholdEnum": "ABOVE",
        "checksGraphResult": {
          "took": 1,
          "timed_out": false,
          "_shards": {
            "total": 1,
            "successful": 1,
            "skipped": 0,
            "failed": 0
          },
          "hits": {
            "total": {
              "value": 77,
              "relation": "eq"
            },
            "max_score": null,
            "hits": []
          },
          "aggregations": {
            "bucketAgg": {
              "doc_count_error_upper_bound": 0,
              "sum_other_doc_count": 23,
              "buckets": [
                {
                  "key": "JetBeats",
                  "doc_count": 16,
                  "dateAgg": {
                    "buckets": [
                      {
                        "key_as_string": "2019-11-21T10:00:00.000+01:00",
                        "key": 1574326800000,
                        "doc_count": 3
                      },
                      {
                        "key_as_string": "2019-11-21T11:00:00.000+01:00",
                        "key": 1574330400000,
                        "doc_count": 2
                      }
                    ]
                  }
                },
                {
                  "key": "Kibana Airlines",
                  "doc_count": 16,
                  "dateAgg": {
                    "buckets": [
                      {
                        "key_as_string": "2019-11-21T10:00:00.000+01:00",
                        "key": 1574326800000,
                        "doc_count": 1
                      },
                      {
                        "key_as_string": "2019-11-21T11:00:00.000+01:00",
                        "key": 1574330400000,
                        "doc_count": 4
                      }
                    ]
                  }
                },
                {
                  "key": "ES-Air",
                  "doc_count": 22,
                  "dateAgg": {
                    "buckets": [
                      {
                        "key_as_string": "2019-11-21T10:00:00.000+01:00",
                        "key": 1574326800000,
                        "doc_count": 6
                      },
                      {
                        "key_as_string": "2019-11-21T11:00:00.000+01:00",
                        "key": 1574330400000,
                        "doc_count": 4
                      }
                    ]
                  }
                }
              ]
            }
          }
        },
        "checksResult": {
          "mysearch": {
            "took": 1,
            "timed_out": false,
            "_shards": {
              "total": 1,
              "successful": 1,
              "skipped": 0,
              "failed": 0
            },
            "hits": {
              "total": {
                "value": 77,
                "relation": "eq"
              },
              "max_score": null,
              "hits": []
            },
            "aggregations": {
              "bucketAgg": {
                "doc_count_error_upper_bound": 0,
                "sum_other_doc_count": 23,
                "buckets": [
                  {
                    "key": "JetBeats",
                    "doc_count": 16
                  },
                  {
                    "key": "Kibana Airlines",
                    "doc_count": 16
                  },
                  {
                    "key": "ES-Air",
                    "doc_count": 22
                  }
                ]
              }
            }
          }
        },
        "checksBlocks": [
          {
            "response": "",
            "check": "{\n  \"type\": \"search\",\n  \"name\": \"mysearch\",\n  \"target\": \"mysearch\",\n  \"request\": {\n    \"indices\": [\n      \"kibana_sample_data_flights\"\n    ],\n    \"body\": {\n      \"size\": 0,\n      \"aggregations\": {\n        \"bucketAgg\": {\n          \"terms\": {\n            \"field\": \"Carrier\",\n            \"size\": 3,\n            \"order\": {\n              \"_count\": \"asc\"\n            }\n          }\n        }\n      },\n      \"query\": {\n        \"bool\": {\n          \"filter\": {\n            \"range\": {\n              \"timestamp\": {\n                \"gte\": \"now-5h\",\n                \"lte\": \"now\"\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}",
            "index": 0
          },
          {
            "response": "",
            "check": "{\n  \"type\": \"condition.script\",\n  \"name\": \"mycondition\",\n  \"source\": \"ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i].doc_count > 100) { return true; } } return false;\"\n}",
            "index": 1
          }
        ],
        "frequency": "interval",
        "period": {
          "interval": 1,
          "advInterval": "1h30m15s",
          "unit": "m"
        },
        "cron": "0 */1 * * * ?",
        "daily": 0,
        "weekly": {
          "mon": false,
          "tue": false,
          "wed": false,
          "thu": false,
          "fri": false,
          "sat": false,
          "sun": false
        },
        "monthly": {
          "type": "day",
          "day": 1
        },
        "timezone": [
          {
            "label": "Europe/Berlin"
          }
        ]
      },
      "_meta": {
        "last_edit": {
          "user": "admin",
          "date": "2019-11-21T12:11:27.521Z"
        }
      },
      "log_runtime_data": false,
      "_tenant": "admin_tenant"
    };

    const watch = {
      "active": true,
      "trigger": {
        "schedule": {
          "interval": [
            "1m"
          ],
          "timezone": "Europe/Berlin"
        }
      },
      "checks": [
        {
          "type": "search",
          "name": "mysearch",
          "target": "mysearch",
          "request": {
            "indices": [
              "kibana_sample_data_flights"
            ],
            "body": {
              "size": 0,
              "aggregations": {
                "bucketAgg": {
                  "terms": {
                    "field": "Carrier",
                    "size": 3,
                    "order": {
                      "_count": "asc"
                    }
                  }
                }
              },
              "query": {
                "bool": {
                  "filter": {
                    "range": {
                      "timestamp": {
                        "gte": "now-5h",
                        "lte": "now"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        {
          "type": "condition.script",
          "name": "mycondition",
          "source": "ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i].doc_count > 100) { return true; } } return false;"
        }
      ],
      "actions": [
        {
          "type": "webhook",
          "name": "mywebhook",
          "request": {
            "method": "POST",
            "url": "https://hooks.slack.com/services/111/111/111",
            "body": "Total: {{data.mysearch.hits.total.value}}",
            "headers": {
              "Content-type": "application/json"
            }
          },
          "throttle_period": "1s"
        }
      ],
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "kibana_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "count",
        "fieldName": [],
        "topHitsAgg": {
          "field": [
            {
              "label": "Carrier"
            }
          ],
          "size": 3,
          "order": "asc"
        },
        "overDocuments": "top_hits",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 100,
        "thresholdEnum": "ABOVE"
      },
      "_meta": {
        "last_edit": {
          "user": "admin",
          "date": "2019-11-21T12:11:27.521Z"
        }
      },
      "log_runtime_data": false,
      "_tenant": "admin_tenant"
    };

    expect(formikToWatch(formik)).toEqual(watch);
  });

  test('formik to watch: avg all docs', () => {
    const formik = {
      "_id": "avg all docs",
      "active": true,
      "trigger": {
        "schedule": {
          "interval": [
            "1m"
          ]
        }
      },
      "checks": "[\n  {\n    \"type\": \"search\",\n    \"name\": \"mysearch\",\n    \"target\": \"mysearch\",\n    \"request\": {\n      \"indices\": [\n        \"kibana_sample_data_flights\"\n      ],\n      \"body\": {\n        \"size\": 0,\n        \"aggregations\": {\n          \"metricAgg\": {\n            \"avg\": {\n              \"field\": \"AvgTicketPrice\"\n            }\n          }\n        },\n        \"query\": {\n          \"bool\": {\n            \"filter\": {\n              \"range\": {\n                \"timestamp\": {\n                  \"gte\": \"now-1h\",\n                  \"lte\": \"now\"\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  },\n  {\n    \"type\": \"condition.script\",\n    \"name\": \"mycondition\",\n    \"source\": \"data.mysearch.aggregations.metricAgg.value > 500\"\n  }\n]",
      "actions": [
        {
          "type": "webhook",
          "name": "mywebhook",
          "throttle_period": {
            "interval": 1,
            "advInterval": "1h30m15s",
            "unit": "s"
          },
          "request": {
            "method": "POST",
            "url": "https://hooks.slack.com/services/111/111/111",
            "body": "Total: {{data.mysearch.hits.total.value}}",
            "headers": "{\n  \"Content-type\": \"application/json\"\n}"
          }
        }
      ],
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "kibana_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "avg",
        "fieldName": [
          {
            "label": "AvgTicketPrice"
          }
        ],
        "topHitsAgg": {
          "field": [],
          "size": 3,
          "order": "asc"
        },
        "overDocuments": "all documents",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 500,
        "thresholdEnum": "ABOVE",
        "checksGraphResult": {
          "took": 1,
          "timed_out": false,
          "_shards": {
            "total": 1,
            "successful": 1,
            "skipped": 0,
            "failed": 0
          },
          "hits": {
            "total": {
              "value": 80,
              "relation": "eq"
            },
            "max_score": null,
            "hits": []
          },
          "aggregations": {
            "dateAgg": {
              "buckets": [
                {
                  "key_as_string": "2019-11-21T08:00:00.000+01:00",
                  "key": 1574319600000,
                  "doc_count": 8,
                  "metricAgg": {
                    "value": 518.0074214935303
                  }
                },
                {
                  "key_as_string": "2019-11-21T09:00:00.000+01:00",
                  "key": 1574323200000,
                  "doc_count": 19,
                  "metricAgg": {
                    "value": 503.69927697432666
                  }
                }
              ]
            }
          }
        },
        "checksResult": {
          "mysearch": {
            "took": 0,
            "timed_out": false,
            "_shards": {
              "total": 1,
              "successful": 1,
              "skipped": 0,
              "failed": 0
            },
            "hits": {
              "total": {
                "value": 22,
                "relation": "eq"
              },
              "max_score": null,
              "hits": []
            },
            "aggregations": {
              "metricAgg": {
                "value": 551.2095080288974
              }
            }
          }
        },
        "checksBlocks": [
          {
            "response": "",
            "check": "{\n  \"type\": \"search\",\n  \"name\": \"mysearch\",\n  \"target\": \"mysearch\",\n  \"request\": {\n    \"indices\": [\n      \"kibana_sample_data_flights\"\n    ],\n    \"body\": {\n      \"size\": 0,\n      \"aggregations\": {\n        \"metricAgg\": {\n          \"avg\": {\n            \"field\": \"AvgTicketPrice\"\n          }\n        }\n      },\n      \"query\": {\n        \"bool\": {\n          \"filter\": {\n            \"range\": {\n              \"timestamp\": {\n                \"gte\": \"now-1h\",\n                \"lte\": \"now\"\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}",
            "index": 0
          },
          {
            "response": "",
            "check": "{\n  \"type\": \"condition.script\",\n  \"name\": \"mycondition\",\n  \"source\": \"data.mysearch.aggregations.metricAgg.value > 500\"\n}",
            "index": 1
          }
        ],
        "frequency": "interval",
        "period": {
          "interval": 1,
          "advInterval": "1h30m15s",
          "unit": "m"
        },
        "cron": "0 */1 * * * ?",
        "daily": 0,
        "weekly": {
          "mon": false,
          "tue": false,
          "wed": false,
          "thu": false,
          "fri": false,
          "sat": false,
          "sun": false
        },
        "monthly": {
          "type": "day",
          "day": 1
        },
        "timezone": [
          {
            "label": "Europe/Berlin"
          }
        ]
      },
      "_meta": {
        "last_edit": {
          "user": "admin",
          "date": "2019-11-21T11:33:56.235Z"
        }
      },
      "log_runtime_data": false,
      "_tenant": "admin_tenant"
    };

    const watch = {
      "active": true,
      "trigger": {
        "schedule": {
          "interval": [
            "1m"
          ],
          "timezone": "Europe/Berlin"
        }
      },
      "checks": [
        {
          "type": "search",
          "name": "mysearch",
          "target": "mysearch",
          "request": {
            "indices": [
              "kibana_sample_data_flights"
            ],
            "body": {
              "size": 0,
              "aggregations": {
                "metricAgg": {
                  "avg": {
                    "field": "AvgTicketPrice"
                  }
                }
              },
              "query": {
                "bool": {
                  "filter": {
                    "range": {
                      "timestamp": {
                        "gte": "now-1h",
                        "lte": "now"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        {
          "type": "condition.script",
          "name": "mycondition",
          "source": "data.mysearch.aggregations.metricAgg.value > 500"
        }
      ],
      "actions": [
        {
          "type": "webhook",
          "name": "mywebhook",
          "request": {
            "method": "POST",
            "url": "https://hooks.slack.com/services/111/111/111",
            "body": "Total: {{data.mysearch.hits.total.value}}",
            "headers": {
              "Content-type": "application/json"
            }
          },
          "throttle_period": "1s"
        }
      ],
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "kibana_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "avg",
        "fieldName": [
          {
            "label": "AvgTicketPrice"
          }
        ],
        "topHitsAgg": {
          "field": [],
          "size": 3,
          "order": "asc"
        },
        "overDocuments": "all documents",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 500,
        "thresholdEnum": "ABOVE"
      },
      "_meta": {
        "last_edit": {
          "user": "admin",
          "date": "2019-11-21T11:33:56.235Z"
        }
      },
      "log_runtime_data": false,
      "_tenant": "admin_tenant"
    };

    expect(formikToWatch(formik)).toEqual(watch);
  });

  test('formik to watch: avg top_hits', () => {
    const formik = {
      "_id": "avg top_hits",
      "active": true,
      "trigger": {
        "schedule": {
          "interval": [
            "1m"
          ]
        }
      },
      "checks": "[\n  {\n    \"type\": \"search\",\n    \"name\": \"mysearch\",\n    \"target\": \"mysearch\",\n    \"request\": {\n      \"indices\": [\n        \"kibana_sample_data_flights\"\n      ],\n      \"body\": {\n        \"size\": 0,\n        \"aggregations\": {\n          \"bucketAgg\": {\n            \"terms\": {\n              \"field\": \"Carrier\",\n              \"size\": 3,\n              \"order\": {\n                \"metricAgg\": \"asc\"\n              }\n            },\n            \"aggregations\": {\n              \"metricAgg\": {\n                \"avg\": {\n                  \"field\": \"AvgTicketPrice\"\n                }\n              }\n            }\n          }\n        },\n        \"query\": {\n          \"bool\": {\n            \"filter\": {\n              \"range\": {\n                \"timestamp\": {\n                  \"gte\": \"now-5h\",\n                  \"lte\": \"now\"\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  },\n  {\n    \"type\": \"condition.script\",\n    \"name\": \"mycondition\",\n    \"source\": \"ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i]['metricAgg'].value > 500) { return true; } } return false;\"\n  }\n]",
      "actions": [
        {
          "type": "webhook",
          "name": "mywebhook",
          "throttle_period": {
            "interval": 1,
            "advInterval": "1h30m15s",
            "unit": "s"
          },
          "request": {
            "method": "POST",
            "url": "https://hooks.slack.com/services/111/111/111",
            "body": "Total: {{data.mysearch.hits.total.value}}",
            "headers": "{\n  \"Content-type\": \"application/json\"\n}"
          }
        }
      ],
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "kibana_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "avg",
        "fieldName": [
          {
            "label": "AvgTicketPrice"
          }
        ],
        "topHitsAgg": {
          "field": [
            {
              "label": "Carrier"
            }
          ],
          "size": 3,
          "order": "asc"
        },
        "overDocuments": "top_hits",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 500,
        "thresholdEnum": "ABOVE",
        "checksGraphResult": {
          "took": 1,
          "timed_out": false,
          "_shards": {
            "total": 1,
            "successful": 1,
            "skipped": 0,
            "failed": 0
          },
          "hits": {
            "total": {
              "value": 80,
              "relation": "eq"
            },
            "max_score": null,
            "hits": []
          },
          "aggregations": {
            "bucketAgg": {
              "doc_count_error_upper_bound": 0,
              "sum_other_doc_count": 13,
              "buckets": [
                {
                  "key": "Kibana Airlines",
                  "doc_count": 22,
                  "dateAgg": {
                    "buckets": [
                      {
                        "key_as_string": "2019-11-21T08:00:00.000+01:00",
                        "key": 1574319600000,
                        "doc_count": 3,
                        "metricAgg": {
                          "value": 477.92188517252606
                        }
                      },
                      {
                        "key_as_string": "2019-11-21T09:00:00.000+01:00",
                        "key": 1574323200000,
                        "doc_count": 9,
                        "metricAgg": {
                          "value": 420.81727515326605
                        }
                      }
                    ]
                  },
                  "metricAgg": {
                    "value": 512.5586093555797
                  }
                },
                {
                  "key": "Logstash Airways",
                  "doc_count": 19,
                  "dateAgg": {
                    "buckets": [
                      {
                        "key_as_string": "2019-11-21T08:00:00.000+01:00",
                        "key": 1574319600000,
                        "doc_count": 1,
                        "metricAgg": {
                          "value": 105.32759094238281
                        }
                      },
                      {
                        "key_as_string": "2019-11-21T09:00:00.000+01:00",
                        "key": 1574323200000,
                        "doc_count": 3,
                        "metricAgg": {
                          "value": 546.9427286783854
                        }
                      }
                    ]
                  },
                  "metricAgg": {
                    "value": 524.6190450567948
                  }
                },
                {
                  "key": "ES-Air",
                  "doc_count": 26,
                  "dateAgg": {
                    "buckets": [
                      {
                        "key_as_string": "2019-11-21T08:00:00.000+01:00",
                        "key": 1574319600000,
                        "doc_count": 3,
                        "metricAgg": {
                          "value": 646.4732055664062
                        }
                      },
                      {
                        "key_as_string": "2019-11-21T09:00:00.000+01:00",
                        "key": 1574323200000,
                        "doc_count": 6,
                        "metricAgg": {
                          "value": 573.434336344401
                        }
                      }
                    ]
                  },
                  "metricAgg": {
                    "value": 576.7085163409894
                  }
                }
              ]
            }
          }
        },
        "checksResult": {
          "mysearch": {
            "took": 1,
            "timed_out": false,
            "_shards": {
              "total": 1,
              "successful": 1,
              "skipped": 0,
              "failed": 0
            },
            "hits": {
              "total": {
                "value": 80,
                "relation": "eq"
              },
              "max_score": null,
              "hits": []
            },
            "aggregations": {
              "bucketAgg": {
                "doc_count_error_upper_bound": 0,
                "sum_other_doc_count": 13,
                "buckets": [
                  {
                    "key": "Kibana Airlines",
                    "doc_count": 22,
                    "metricAgg": {
                      "value": 512.5586093555797
                    }
                  },
                  {
                    "key": "Logstash Airways",
                    "doc_count": 19,
                    "metricAgg": {
                      "value": 524.6190450567948
                    }
                  },
                  {
                    "key": "ES-Air",
                    "doc_count": 26,
                    "metricAgg": {
                      "value": 576.7085163409894
                    }
                  }
                ]
              }
            }
          }
        },
        "checksBlocks": [
          {
            "response": "",
            "check": "{\n  \"type\": \"search\",\n  \"name\": \"mysearch\",\n  \"target\": \"mysearch\",\n  \"request\": {\n    \"indices\": [\n      \"kibana_sample_data_flights\"\n    ],\n    \"body\": {\n      \"size\": 0,\n      \"aggregations\": {\n        \"bucketAgg\": {\n          \"terms\": {\n            \"field\": \"Carrier\",\n            \"size\": 3,\n            \"order\": {\n              \"metricAgg\": \"asc\"\n            }\n          },\n          \"aggregations\": {\n            \"metricAgg\": {\n              \"avg\": {\n                \"field\": \"AvgTicketPrice\"\n              }\n            }\n          }\n        }\n      },\n      \"query\": {\n        \"bool\": {\n          \"filter\": {\n            \"range\": {\n              \"timestamp\": {\n                \"gte\": \"now-5h\",\n                \"lte\": \"now\"\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}",
            "index": 0
          },
          {
            "response": "",
            "check": "{\n  \"type\": \"condition.script\",\n  \"name\": \"mycondition\",\n  \"source\": \"ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i]['metricAgg'].value > 500) { return true; } } return false;\"\n}",
            "index": 1
          }
        ],
        "frequency": "interval",
        "period": {
          "interval": 1,
          "advInterval": "1h30m15s",
          "unit": "m"
        },
        "cron": "0 */1 * * * ?",
        "daily": 0,
        "weekly": {
          "mon": false,
          "tue": false,
          "wed": false,
          "thu": false,
          "fri": false,
          "sat": false,
          "sun": false
        },
        "monthly": {
          "type": "day",
          "day": 1
        },
        "timezone": [
          {
            "label": "Europe/Berlin"
          }
        ]
      },
      "_meta": {
        "last_edit": {
          "user": "admin",
          "date": "2019-11-21T11:36:17.486Z"
        }
      },
      "log_runtime_data": false,
      "_tenant": "admin_tenant"
    };

    const watch = {
      "active": true,
      "trigger": {
        "schedule": {
          "interval": [
            "1m"
          ],
          "timezone": "Europe/Berlin"
        }
      },
      "checks": [
        {
          "type": "search",
          "name": "mysearch",
          "target": "mysearch",
          "request": {
            "indices": [
              "kibana_sample_data_flights"
            ],
            "body": {
              "size": 0,
              "aggregations": {
                "bucketAgg": {
                  "terms": {
                    "field": "Carrier",
                    "size": 3,
                    "order": {
                      "metricAgg": "asc"
                    }
                  },
                  "aggregations": {
                    "metricAgg": {
                      "avg": {
                        "field": "AvgTicketPrice"
                      }
                    }
                  }
                }
              },
              "query": {
                "bool": {
                  "filter": {
                    "range": {
                      "timestamp": {
                        "gte": "now-5h",
                        "lte": "now"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        {
          "type": "condition.script",
          "name": "mycondition",
          "source": "ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i]['metricAgg'].value > 500) { return true; } } return false;"
        }
      ],
      "actions": [
        {
          "type": "webhook",
          "name": "mywebhook",
          "request": {
            "method": "POST",
            "url": "https://hooks.slack.com/services/111/111/111",
            "body": "Total: {{data.mysearch.hits.total.value}}",
            "headers": {
              "Content-type": "application/json"
            }
          },
          "throttle_period": "1s"
        }
      ],
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "kibana_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "avg",
        "fieldName": [
          {
            "label": "AvgTicketPrice"
          }
        ],
        "topHitsAgg": {
          "field": [
            {
              "label": "Carrier"
            }
          ],
          "size": 3,
          "order": "asc"
        },
        "overDocuments": "top_hits",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 500,
        "thresholdEnum": "ABOVE"
      },
      "_meta": {
        "last_edit": {
          "user": "admin",
          "date": "2019-11-21T11:36:17.486Z"
        }
      },
      "log_runtime_data": false,
      "_tenant": "admin_tenant"
    };

    expect(formikToWatch(formik)).toEqual(watch);
  });

  test('formik to watch: sum all docs', () => {
    const formik = {
      "_id": "sum all docs",
      "active": true,
      "trigger": {
        "schedule": {
          "interval": [
            "1m"
          ]
        }
      },
      "checks": "[\n  {\n    \"type\": \"search\",\n    \"name\": \"mysearch\",\n    \"target\": \"mysearch\",\n    \"request\": {\n      \"indices\": [\n        \"kibana_sample_data_flights\"\n      ],\n      \"body\": {\n        \"size\": 0,\n        \"aggregations\": {\n          \"metricAgg\": {\n            \"sum\": {\n              \"field\": \"AvgTicketPrice\"\n            }\n          }\n        },\n        \"query\": {\n          \"bool\": {\n            \"filter\": {\n              \"range\": {\n                \"timestamp\": {\n                  \"gte\": \"now-1h\",\n                  \"lte\": \"now\"\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  },\n  {\n    \"type\": \"condition.script\",\n    \"name\": \"mycondition\",\n    \"source\": \"data.mysearch.aggregations.metricAgg.value > 500\"\n  }\n]",
      "actions": [
        {
          "type": "webhook",
          "name": "mywebhook",
          "throttle_period": {
            "interval": 1,
            "advInterval": "1h30m15s",
            "unit": "s"
          },
          "request": {
            "method": "POST",
            "url": "https://hooks.slack.com/services/111/111/111",
            "body": "Total: {{data.mysearch.hits.total.value}}",
            "headers": "{\n  \"Content-type\": \"application/json\"\n}"
          }
        }
      ],
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "kibana_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "sum",
        "fieldName": [
          {
            "label": "AvgTicketPrice"
          }
        ],
        "topHitsAgg": {
          "field": [],
          "size": 3,
          "order": "asc"
        },
        "overDocuments": "all documents",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 500,
        "thresholdEnum": "ABOVE",
        "checksGraphResult": {
          "took": 1,
          "timed_out": false,
          "_shards": {
            "total": 1,
            "successful": 1,
            "skipped": 0,
            "failed": 0
          },
          "hits": {
            "total": {
              "value": 80,
              "relation": "eq"
            },
            "max_score": null,
            "hits": []
          },
          "aggregations": {
            "dateAgg": {
              "buckets": [
                {
                  "key_as_string": "2019-11-21T08:00:00.000+01:00",
                  "key": 1574319600000,
                  "doc_count": 8,
                  "metricAgg": {
                    "value": 4144.059371948242
                  }
                },
                {
                  "key_as_string": "2019-11-21T09:00:00.000+01:00",
                  "key": 1574323200000,
                  "doc_count": 19,
                  "metricAgg": {
                    "value": 9570.286262512207
                  }
                }
              ]
            }
          }
        },
        "checksResult": {
          "mysearch": {
            "took": 0,
            "timed_out": false,
            "_shards": {
              "total": 1,
              "successful": 1,
              "skipped": 0,
              "failed": 0
            },
            "hits": {
              "total": {
                "value": 21,
                "relation": "eq"
              },
              "max_score": null,
              "hits": []
            },
            "aggregations": {
              "metricAgg": {
                "value": 11423.942794799805
              }
            }
          }
        },
        "checksBlocks": [
          {
            "response": "",
            "check": "{\n  \"type\": \"search\",\n  \"name\": \"mysearch\",\n  \"target\": \"mysearch\",\n  \"request\": {\n    \"indices\": [\n      \"kibana_sample_data_flights\"\n    ],\n    \"body\": {\n      \"size\": 0,\n      \"aggregations\": {\n        \"metricAgg\": {\n          \"sum\": {\n            \"field\": \"AvgTicketPrice\"\n          }\n        }\n      },\n      \"query\": {\n        \"bool\": {\n          \"filter\": {\n            \"range\": {\n              \"timestamp\": {\n                \"gte\": \"now-1h\",\n                \"lte\": \"now\"\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}",
            "index": 0
          },
          {
            "response": "",
            "check": "{\n  \"type\": \"condition.script\",\n  \"name\": \"mycondition\",\n  \"source\": \"data.mysearch.aggregations.metricAgg.value > 500\"\n}",
            "index": 1
          }
        ],
        "frequency": "interval",
        "period": {
          "interval": 1,
          "advInterval": "1h30m15s",
          "unit": "m"
        },
        "cron": "0 */1 * * * ?",
        "daily": 0,
        "weekly": {
          "mon": false,
          "tue": false,
          "wed": false,
          "thu": false,
          "fri": false,
          "sat": false,
          "sun": false
        },
        "monthly": {
          "type": "day",
          "day": 1
        },
        "timezone": [
          {
            "label": "Europe/Berlin"
          }
        ]
      },
      "_meta": {
        "last_edit": {
          "user": "admin",
          "date": "2019-11-21T11:37:37.750Z"
        }
      },
      "log_runtime_data": false,
      "_tenant": "admin_tenant"
    };

    const watch = {
      "active": true,
      "trigger": {
        "schedule": {
          "interval": [
            "1m"
          ],
          "timezone": "Europe/Berlin"
        }
      },
      "checks": [
        {
          "type": "search",
          "name": "mysearch",
          "target": "mysearch",
          "request": {
            "indices": [
              "kibana_sample_data_flights"
            ],
            "body": {
              "size": 0,
              "aggregations": {
                "metricAgg": {
                  "sum": {
                    "field": "AvgTicketPrice"
                  }
                }
              },
              "query": {
                "bool": {
                  "filter": {
                    "range": {
                      "timestamp": {
                        "gte": "now-1h",
                        "lte": "now"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        {
          "type": "condition.script",
          "name": "mycondition",
          "source": "data.mysearch.aggregations.metricAgg.value > 500"
        }
      ],
      "actions": [
        {
          "type": "webhook",
          "name": "mywebhook",
          "request": {
            "method": "POST",
            "url": "https://hooks.slack.com/services/111/111/111",
            "body": "Total: {{data.mysearch.hits.total.value}}",
            "headers": {
              "Content-type": "application/json"
            }
          },
          "throttle_period": "1s"
        }
      ],
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "kibana_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "sum",
        "fieldName": [
          {
            "label": "AvgTicketPrice"
          }
        ],
        "topHitsAgg": {
          "field": [],
          "size": 3,
          "order": "asc"
        },
        "overDocuments": "all documents",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 500,
        "thresholdEnum": "ABOVE"
      },
      "_meta": {
        "last_edit": {
          "user": "admin",
          "date": "2019-11-21T11:37:37.750Z"
        }
      },
      "log_runtime_data": false,
      "_tenant": "admin_tenant"
    };

    expect(formikToWatch(formik)).toEqual(watch);
  });

  test('formik to watch: sum top_hits', () => {
    const formik = {
      "_id": "sum top_hits",
      "active": true,
      "trigger": {
        "schedule": {
          "interval": [
            "1m"
          ]
        }
      },
      "checks": "[\n  {\n    \"type\": \"search\",\n    \"name\": \"mysearch\",\n    \"target\": \"mysearch\",\n    \"request\": {\n      \"indices\": [\n        \"kibana_sample_data_flights\"\n      ],\n      \"body\": {\n        \"size\": 0,\n        \"aggregations\": {\n          \"bucketAgg\": {\n            \"terms\": {\n              \"field\": \"Carrier\",\n              \"size\": 3,\n              \"order\": {\n                \"metricAgg\": \"asc\"\n              }\n            },\n            \"aggregations\": {\n              \"metricAgg\": {\n                \"sum\": {\n                  \"field\": \"AvgTicketPrice\"\n                }\n              }\n            }\n          }\n        },\n        \"query\": {\n          \"bool\": {\n            \"filter\": {\n              \"range\": {\n                \"timestamp\": {\n                  \"gte\": \"now-5h\",\n                  \"lte\": \"now\"\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  },\n  {\n    \"type\": \"condition.script\",\n    \"name\": \"mycondition\",\n    \"source\": \"ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i]['metricAgg'].value > 500) { return true; } } return false;\"\n  }\n]",
      "actions": [
        {
          "type": "webhook",
          "name": "mywebhook",
          "throttle_period": {
            "interval": 1,
            "advInterval": "1h30m15s",
            "unit": "s"
          },
          "request": {
            "method": "POST",
            "url": "https://hooks.slack.com/services/111/111/111",
            "body": "Total: {{data.mysearch.hits.total.value}}",
            "headers": "{\n  \"Content-type\": \"application/json\"\n}"
          }
        }
      ],
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "kibana_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "sum",
        "fieldName": [
          {
            "label": "AvgTicketPrice"
          }
        ],
        "topHitsAgg": {
          "field": [
            {
              "label": "Carrier"
            }
          ],
          "size": 3,
          "order": "asc"
        },
        "overDocuments": "top_hits",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 500,
        "thresholdEnum": "ABOVE",
        "checksGraphResult": {
          "took": 3,
          "timed_out": false,
          "_shards": {
            "total": 1,
            "successful": 1,
            "skipped": 0,
            "failed": 0
          },
          "hits": {
            "total": {
              "value": 76,
              "relation": "eq"
            },
            "max_score": null,
            "hits": []
          },
          "aggregations": {
            "bucketAgg": {
              "doc_count_error_upper_bound": 0,
              "sum_other_doc_count": 23,
              "buckets": [
                {
                  "key": "JetBeats",
                  "doc_count": 15,
                  "dateAgg": {
                    "buckets": [
                      {
                        "key_as_string": "2019-11-21T10:00:00.000+01:00",
                        "key": 1574326800000,
                        "doc_count": 2,
                        "metricAgg": {
                          "value": 1560.6395874023438
                        }
                      },
                      {
                        "key_as_string": "2019-11-21T11:00:00.000+01:00",
                        "key": 1574330400000,
                        "doc_count": 2,
                        "metricAgg": {
                          "value": 398.9243850708008
                        }
                      }
                    ]
                  },
                  "metricAgg": {
                    "value": 7678.324684143066
                  }
                },
                {
                  "key": "Kibana Airlines",
                  "doc_count": 16,
                  "dateAgg": {
                    "buckets": [
                      {
                        "key_as_string": "2019-11-21T10:00:00.000+01:00",
                        "key": 1574326800000,
                        "doc_count": 1,
                        "metricAgg": {
                          "value": 903.0375366210938
                        }
                      },
                      {
                        "key_as_string": "2019-11-21T11:00:00.000+01:00",
                        "key": 1574330400000,
                        "doc_count": 4,
                        "metricAgg": {
                          "value": 2417.8617553710938
                        }
                      }
                    ]
                  },
                  "metricAgg": {
                    "value": 9860.035675048828
                  }
                },
                {
                  "key": "ES-Air",
                  "doc_count": 22,
                  "dateAgg": {
                    "buckets": [
                      {
                        "key_as_string": "2019-11-21T10:00:00.000+01:00",
                        "key": 1574326800000,
                        "doc_count": 6,
                        "metricAgg": {
                          "value": 3218.13037109375
                        }
                      },
                      {
                        "key_as_string": "2019-11-21T11:00:00.000+01:00",
                        "key": 1574330400000,
                        "doc_count": 4,
                        "metricAgg": {
                          "value": 2563.1264724731445
                        }
                      }
                    ]
                  },
                  "metricAgg": {
                    "value": 11911.867210388184
                  }
                }
              ]
            }
          }
        },
        "checksResult": {
          "mysearch": {
            "took": 2,
            "timed_out": false,
            "_shards": {
              "total": 1,
              "successful": 1,
              "skipped": 0,
              "failed": 0
            },
            "hits": {
              "total": {
                "value": 76,
                "relation": "eq"
              },
              "max_score": null,
              "hits": []
            },
            "aggregations": {
              "bucketAgg": {
                "doc_count_error_upper_bound": 0,
                "sum_other_doc_count": 23,
                "buckets": [
                  {
                    "key": "JetBeats",
                    "doc_count": 15,
                    "metricAgg": {
                      "value": 7678.324684143066
                    }
                  },
                  {
                    "key": "Kibana Airlines",
                    "doc_count": 16,
                    "metricAgg": {
                      "value": 9860.035675048828
                    }
                  },
                  {
                    "key": "ES-Air",
                    "doc_count": 22,
                    "metricAgg": {
                      "value": 11911.867210388184
                    }
                  }
                ]
              }
            }
          }
        },
        "checksBlocks": [
          {
            "response": "",
            "check": "{\n  \"type\": \"search\",\n  \"name\": \"mysearch\",\n  \"target\": \"mysearch\",\n  \"request\": {\n    \"indices\": [\n      \"kibana_sample_data_flights\"\n    ],\n    \"body\": {\n      \"size\": 0,\n      \"aggregations\": {\n        \"bucketAgg\": {\n          \"terms\": {\n            \"field\": \"Carrier\",\n            \"size\": 3,\n            \"order\": {\n              \"metricAgg\": \"asc\"\n            }\n          },\n          \"aggregations\": {\n            \"metricAgg\": {\n              \"sum\": {\n                \"field\": \"AvgTicketPrice\"\n              }\n            }\n          }\n        }\n      },\n      \"query\": {\n        \"bool\": {\n          \"filter\": {\n            \"range\": {\n              \"timestamp\": {\n                \"gte\": \"now-5h\",\n                \"lte\": \"now\"\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}",
            "index": 0
          },
          {
            "response": "",
            "check": "{\n  \"type\": \"condition.script\",\n  \"name\": \"mycondition\",\n  \"source\": \"ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i]['metricAgg'].value > 500) { return true; } } return false;\"\n}",
            "index": 1
          }
        ],
        "frequency": "interval",
        "period": {
          "interval": 1,
          "advInterval": "1h30m15s",
          "unit": "m"
        },
        "cron": "0 */1 * * * ?",
        "daily": 0,
        "weekly": {
          "mon": false,
          "tue": false,
          "wed": false,
          "thu": false,
          "fri": false,
          "sat": false,
          "sun": false
        },
        "monthly": {
          "type": "day",
          "day": 1
        },
        "timezone": [
          {
            "label": "Europe/Berlin"
          }
        ]
      },
      "_meta": {
        "last_edit": {
          "user": "admin",
          "date": "2019-11-21T12:15:37.705Z"
        }
      },
      "log_runtime_data": false,
      "_tenant": "admin_tenant"
    };

    const watch = {
      "active": true,
      "trigger": {
        "schedule": {
          "interval": [
            "1m"
          ],
          "timezone": "Europe/Berlin"
        }
      },
      "checks": [
        {
          "type": "search",
          "name": "mysearch",
          "target": "mysearch",
          "request": {
            "indices": [
              "kibana_sample_data_flights"
            ],
            "body": {
              "size": 0,
              "aggregations": {
                "bucketAgg": {
                  "terms": {
                    "field": "Carrier",
                    "size": 3,
                    "order": {
                      "metricAgg": "asc"
                    }
                  },
                  "aggregations": {
                    "metricAgg": {
                      "sum": {
                        "field": "AvgTicketPrice"
                      }
                    }
                  }
                }
              },
              "query": {
                "bool": {
                  "filter": {
                    "range": {
                      "timestamp": {
                        "gte": "now-5h",
                        "lte": "now"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        {
          "type": "condition.script",
          "name": "mycondition",
          "source": "ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i]['metricAgg'].value > 500) { return true; } } return false;"
        }
      ],
      "actions": [
        {
          "type": "webhook",
          "name": "mywebhook",
          "request": {
            "method": "POST",
            "url": "https://hooks.slack.com/services/111/111/111",
            "body": "Total: {{data.mysearch.hits.total.value}}",
            "headers": {
              "Content-type": "application/json"
            }
          },
          "throttle_period": "1s"
        }
      ],
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "kibana_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "sum",
        "fieldName": [
          {
            "label": "AvgTicketPrice"
          }
        ],
        "topHitsAgg": {
          "field": [
            {
              "label": "Carrier"
            }
          ],
          "size": 3,
          "order": "asc"
        },
        "overDocuments": "top_hits",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 500,
        "thresholdEnum": "ABOVE"
      },
      "_meta": {
        "last_edit": {
          "user": "admin",
          "date": "2019-11-21T12:15:37.705Z"
        }
      },
      "log_runtime_data": false,
      "_tenant": "admin_tenant"
    };

    expect(formikToWatch(formik)).toEqual(watch);
  });

  test('formik to watch: min all docs', () => {
    const formik = {
      "_id": "min all docs",
      "active": true,
      "trigger": {
        "schedule": {
          "interval": [
            "1m"
          ]
        }
      },
      "checks": "[\n  {\n    \"type\": \"search\",\n    \"name\": \"mysearch\",\n    \"target\": \"mysearch\",\n    \"request\": {\n      \"indices\": [\n        \"kibana_sample_data_flights\"\n      ],\n      \"body\": {\n        \"size\": 0,\n        \"aggregations\": {\n          \"metricAgg\": {\n            \"min\": {\n              \"field\": \"AvgTicketPrice\"\n            }\n          }\n        },\n        \"query\": {\n          \"bool\": {\n            \"filter\": {\n              \"range\": {\n                \"timestamp\": {\n                  \"gte\": \"now-1h\",\n                  \"lte\": \"now\"\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  },\n  {\n    \"type\": \"condition.script\",\n    \"name\": \"mycondition\",\n    \"source\": \"data.mysearch.aggregations.metricAgg.value > 500\"\n  }\n]",
      "actions": [
        {
          "type": "webhook",
          "name": "mywebhook",
          "throttle_period": {
            "interval": 1,
            "advInterval": "1h30m15s",
            "unit": "s"
          },
          "request": {
            "method": "POST",
            "url": "https://hooks.slack.com/services/111/111/111",
            "body": "Total: {{data.mysearch.hits.total.value}}",
            "headers": "{\n  \"Content-type\": \"application/json\"\n}"
          }
        }
      ],
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "kibana_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "min",
        "fieldName": [
          {
            "label": "AvgTicketPrice"
          }
        ],
        "topHitsAgg": {
          "field": [],
          "size": 3,
          "order": "asc"
        },
        "overDocuments": "all documents",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 500,
        "thresholdEnum": "ABOVE",
        "checksGraphResult": {
          "took": 1,
          "timed_out": false,
          "_shards": {
            "total": 1,
            "successful": 1,
            "skipped": 0,
            "failed": 0
          },
          "hits": {
            "total": {
              "value": 80,
              "relation": "eq"
            },
            "max_score": null,
            "hits": []
          },
          "aggregations": {
            "dateAgg": {
              "buckets": [
                {
                  "key_as_string": "2019-11-21T08:00:00.000+01:00",
                  "key": 1574319600000,
                  "doc_count": 8,
                  "metricAgg": {
                    "value": 105.32759094238281
                  }
                },
                {
                  "key_as_string": "2019-11-21T09:00:00.000+01:00",
                  "key": 1574323200000,
                  "doc_count": 19,
                  "metricAgg": {
                    "value": 103.86808013916016
                  }
                }
              ]
            }
          }
        },
        "checksResult": {
          "mysearch": {
            "took": 0,
            "timed_out": false,
            "_shards": {
              "total": 1,
              "successful": 1,
              "skipped": 0,
              "failed": 0
            },
            "hits": {
              "total": {
                "value": 21,
                "relation": "eq"
              },
              "max_score": null,
              "hits": []
            },
            "aggregations": {
              "metricAgg": {
                "value": 164.3964080810547
              }
            }
          }
        },
        "checksBlocks": [
          {
            "response": "",
            "check": "{\n  \"type\": \"search\",\n  \"name\": \"mysearch\",\n  \"target\": \"mysearch\",\n  \"request\": {\n    \"indices\": [\n      \"kibana_sample_data_flights\"\n    ],\n    \"body\": {\n      \"size\": 0,\n      \"aggregations\": {\n        \"metricAgg\": {\n          \"min\": {\n            \"field\": \"AvgTicketPrice\"\n          }\n        }\n      },\n      \"query\": {\n        \"bool\": {\n          \"filter\": {\n            \"range\": {\n              \"timestamp\": {\n                \"gte\": \"now-1h\",\n                \"lte\": \"now\"\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}",
            "index": 0
          },
          {
            "response": "",
            "check": "{\n  \"type\": \"condition.script\",\n  \"name\": \"mycondition\",\n  \"source\": \"data.mysearch.aggregations.metricAgg.value > 500\"\n}",
            "index": 1
          }
        ],
        "frequency": "interval",
        "period": {
          "interval": 1,
          "advInterval": "1h30m15s",
          "unit": "m"
        },
        "cron": "0 */1 * * * ?",
        "daily": 0,
        "weekly": {
          "mon": false,
          "tue": false,
          "wed": false,
          "thu": false,
          "fri": false,
          "sat": false,
          "sun": false
        },
        "monthly": {
          "type": "day",
          "day": 1
        },
        "timezone": [
          {
            "label": "Europe/Berlin"
          }
        ]
      },
      "_meta": {
        "last_edit": {
          "user": "admin",
          "date": "2019-11-21T11:40:49.279Z"
        }
      },
      "log_runtime_data": false,
      "_tenant": "admin_tenant"
    };

    const watch = {
      "active": true,
      "trigger": {
        "schedule": {
          "interval": [
            "1m"
          ],
          "timezone": "Europe/Berlin"
        }
      },
      "checks": [
        {
          "type": "search",
          "name": "mysearch",
          "target": "mysearch",
          "request": {
            "indices": [
              "kibana_sample_data_flights"
            ],
            "body": {
              "size": 0,
              "aggregations": {
                "metricAgg": {
                  "min": {
                    "field": "AvgTicketPrice"
                  }
                }
              },
              "query": {
                "bool": {
                  "filter": {
                    "range": {
                      "timestamp": {
                        "gte": "now-1h",
                        "lte": "now"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        {
          "type": "condition.script",
          "name": "mycondition",
          "source": "data.mysearch.aggregations.metricAgg.value > 500"
        }
      ],
      "actions": [
        {
          "type": "webhook",
          "name": "mywebhook",
          "request": {
            "method": "POST",
            "url": "https://hooks.slack.com/services/111/111/111",
            "body": "Total: {{data.mysearch.hits.total.value}}",
            "headers": {
              "Content-type": "application/json"
            }
          },
          "throttle_period": "1s"
        }
      ],
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "kibana_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "min",
        "fieldName": [
          {
            "label": "AvgTicketPrice"
          }
        ],
        "topHitsAgg": {
          "field": [],
          "size": 3,
          "order": "asc"
        },
        "overDocuments": "all documents",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 500,
        "thresholdEnum": "ABOVE"
      },
      "_meta": {
        "last_edit": {
          "user": "admin",
          "date": "2019-11-21T11:40:49.279Z"
        }
      },
      "log_runtime_data": false,
      "_tenant": "admin_tenant"
    };

    expect(formikToWatch(formik)).toEqual(watch);
  });

  test('formik to watch: min top_hits', () => {
    const formik = {
      "_id": "min top_hits",
      "active": true,
      "trigger": {
        "schedule": {
          "interval": [
            "1m"
          ]
        }
      },
      "checks": "[\n  {\n    \"type\": \"search\",\n    \"name\": \"mysearch\",\n    \"target\": \"mysearch\",\n    \"request\": {\n      \"indices\": [\n        \"kibana_sample_data_flights\"\n      ],\n      \"body\": {\n        \"size\": 0,\n        \"aggregations\": {\n          \"bucketAgg\": {\n            \"terms\": {\n              \"field\": \"Carrier\",\n              \"size\": 3,\n              \"order\": {\n                \"metricAgg\": \"asc\"\n              }\n            },\n            \"aggregations\": {\n              \"metricAgg\": {\n                \"min\": {\n                  \"field\": \"AvgTicketPrice\"\n                }\n              }\n            }\n          }\n        },\n        \"query\": {\n          \"bool\": {\n            \"filter\": {\n              \"range\": {\n                \"timestamp\": {\n                  \"gte\": \"now-5h\",\n                  \"lte\": \"now\"\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  },\n  {\n    \"type\": \"condition.script\",\n    \"name\": \"mycondition\",\n    \"source\": \"ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i]['metricAgg'].value > 500) { return true; } } return false;\"\n  }\n]",
      "actions": [
        {
          "type": "webhook",
          "name": "mywebhook",
          "throttle_period": {
            "interval": 1,
            "advInterval": "1h30m15s",
            "unit": "s"
          },
          "request": {
            "method": "POST",
            "url": "https://hooks.slack.com/services/111/111/111",
            "body": "Total: {{data.mysearch.hits.total.value}}",
            "headers": "{\n  \"Content-type\": \"application/json\"\n}"
          }
        }
      ],
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "kibana_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "min",
        "fieldName": [
          {
            "label": "AvgTicketPrice"
          }
        ],
        "topHitsAgg": {
          "field": [
            {
              "label": "Carrier"
            }
          ],
          "size": 3,
          "order": "asc"
        },
        "overDocuments": "top_hits",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 500,
        "thresholdEnum": "ABOVE",
        "checksGraphResult": {
          "took": 1,
          "timed_out": false,
          "_shards": {
            "total": 1,
            "successful": 1,
            "skipped": 0,
            "failed": 0
          },
          "hits": {
            "total": {
              "value": 80,
              "relation": "eq"
            },
            "max_score": null,
            "hits": []
          },
          "aggregations": {
            "bucketAgg": {
              "doc_count_error_upper_bound": 0,
              "sum_other_doc_count": 26,
              "buckets": [
                {
                  "key": "Kibana Airlines",
                  "doc_count": 22,
                  "dateAgg": {
                    "buckets": [
                      {
                        "key_as_string": "2019-11-21T08:00:00.000+01:00",
                        "key": 1574319600000,
                        "doc_count": 3,
                        "metricAgg": {
                          "value": 262.3149108886719
                        }
                      },
                      {
                        "key_as_string": "2019-11-21T09:00:00.000+01:00",
                        "key": 1574323200000,
                        "doc_count": 9,
                        "metricAgg": {
                          "value": 103.86808013916016
                        }
                      }
                    ]
                  },
                  "metricAgg": {
                    "value": 103.86808013916016
                  }
                },
                {
                  "key": "Logstash Airways",
                  "doc_count": 19,
                  "dateAgg": {
                    "buckets": [
                      {
                        "key_as_string": "2019-11-21T08:00:00.000+01:00",
                        "key": 1574319600000,
                        "doc_count": 1,
                        "metricAgg": {
                          "value": 105.32759094238281
                        }
                      },
                      {
                        "key_as_string": "2019-11-21T09:00:00.000+01:00",
                        "key": 1574323200000,
                        "doc_count": 3,
                        "metricAgg": {
                          "value": 144.5208740234375
                        }
                      }
                    ]
                  },
                  "metricAgg": {
                    "value": 105.32759094238281
                  }
                },
                {
                  "key": "JetBeats",
                  "doc_count": 13,
                  "dateAgg": {
                    "buckets": [
                      {
                        "key_as_string": "2019-11-21T08:00:00.000+01:00",
                        "key": 1574319600000,
                        "doc_count": 1,
                        "metricAgg": {
                          "value": 665.5465087890625
                        }
                      },
                      {
                        "key_as_string": "2019-11-21T09:00:00.000+01:00",
                        "key": 1574323200000,
                        "doc_count": 1,
                        "metricAgg": {
                          "value": 701.49658203125
                        }
                      }
                    ]
                  },
                  "metricAgg": {
                    "value": 109.07343292236328
                  }
                }
              ]
            }
          }
        },
        "checksResult": {
          "mysearch": {
            "took": 0,
            "timed_out": false,
            "_shards": {
              "total": 1,
              "successful": 1,
              "skipped": 0,
              "failed": 0
            },
            "hits": {
              "total": {
                "value": 80,
                "relation": "eq"
              },
              "max_score": null,
              "hits": []
            },
            "aggregations": {
              "bucketAgg": {
                "doc_count_error_upper_bound": 0,
                "sum_other_doc_count": 26,
                "buckets": [
                  {
                    "key": "Kibana Airlines",
                    "doc_count": 22,
                    "metricAgg": {
                      "value": 103.86808013916016
                    }
                  },
                  {
                    "key": "Logstash Airways",
                    "doc_count": 19,
                    "metricAgg": {
                      "value": 105.32759094238281
                    }
                  },
                  {
                    "key": "JetBeats",
                    "doc_count": 13,
                    "metricAgg": {
                      "value": 109.07343292236328
                    }
                  }
                ]
              }
            }
          }
        },
        "checksBlocks": [
          {
            "response": "",
            "check": "{\n  \"type\": \"search\",\n  \"name\": \"mysearch\",\n  \"target\": \"mysearch\",\n  \"request\": {\n    \"indices\": [\n      \"kibana_sample_data_flights\"\n    ],\n    \"body\": {\n      \"size\": 0,\n      \"aggregations\": {\n        \"bucketAgg\": {\n          \"terms\": {\n            \"field\": \"Carrier\",\n            \"size\": 3,\n            \"order\": {\n              \"metricAgg\": \"asc\"\n            }\n          },\n          \"aggregations\": {\n            \"metricAgg\": {\n              \"min\": {\n                \"field\": \"AvgTicketPrice\"\n              }\n            }\n          }\n        }\n      },\n      \"query\": {\n        \"bool\": {\n          \"filter\": {\n            \"range\": {\n              \"timestamp\": {\n                \"gte\": \"now-5h\",\n                \"lte\": \"now\"\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}",
            "index": 0
          },
          {
            "response": "",
            "check": "{\n  \"type\": \"condition.script\",\n  \"name\": \"mycondition\",\n  \"source\": \"ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i]['metricAgg'].value > 500) { return true; } } return false;\"\n}",
            "index": 1
          }
        ],
        "frequency": "interval",
        "period": {
          "interval": 1,
          "advInterval": "1h30m15s",
          "unit": "m"
        },
        "cron": "0 */1 * * * ?",
        "daily": 0,
        "weekly": {
          "mon": false,
          "tue": false,
          "wed": false,
          "thu": false,
          "fri": false,
          "sat": false,
          "sun": false
        },
        "monthly": {
          "type": "day",
          "day": 1
        },
        "timezone": [
          {
            "label": "Europe/Berlin"
          }
        ]
      },
      "_meta": {
        "last_edit": {
          "user": "admin",
          "date": "2019-11-21T11:42:06.043Z"
        }
      },
      "log_runtime_data": false,
      "_tenant": "admin_tenant"
    };

    const watch = {
      "active": true,
      "trigger": {
        "schedule": {
          "interval": [
            "1m"
          ],
          "timezone": "Europe/Berlin"
        }
      },
      "checks": [
        {
          "type": "search",
          "name": "mysearch",
          "target": "mysearch",
          "request": {
            "indices": [
              "kibana_sample_data_flights"
            ],
            "body": {
              "size": 0,
              "aggregations": {
                "bucketAgg": {
                  "terms": {
                    "field": "Carrier",
                    "size": 3,
                    "order": {
                      "metricAgg": "asc"
                    }
                  },
                  "aggregations": {
                    "metricAgg": {
                      "min": {
                        "field": "AvgTicketPrice"
                      }
                    }
                  }
                }
              },
              "query": {
                "bool": {
                  "filter": {
                    "range": {
                      "timestamp": {
                        "gte": "now-5h",
                        "lte": "now"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        {
          "type": "condition.script",
          "name": "mycondition",
          "source": "ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i]['metricAgg'].value > 500) { return true; } } return false;"
        }
      ],
      "actions": [
        {
          "type": "webhook",
          "name": "mywebhook",
          "request": {
            "method": "POST",
            "url": "https://hooks.slack.com/services/111/111/111",
            "body": "Total: {{data.mysearch.hits.total.value}}",
            "headers": {
              "Content-type": "application/json"
            }
          },
          "throttle_period": "1s"
        }
      ],
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "kibana_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "min",
        "fieldName": [
          {
            "label": "AvgTicketPrice"
          }
        ],
        "topHitsAgg": {
          "field": [
            {
              "label": "Carrier"
            }
          ],
          "size": 3,
          "order": "asc"
        },
        "overDocuments": "top_hits",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 500,
        "thresholdEnum": "ABOVE"
      },
      "_meta": {
        "last_edit": {
          "user": "admin",
          "date": "2019-11-21T11:42:06.043Z"
        }
      },
      "log_runtime_data": false,
      "_tenant": "admin_tenant"
    };

    expect(formikToWatch(formik)).toEqual(watch);
  });

  test('formik to watch: max all docs', () => {
    const formik = {
      "_id": "max all docs",
      "active": true,
      "trigger": {
        "schedule": {
          "interval": [
            "1m"
          ]
        }
      },
      "checks": "[\n  {\n    \"type\": \"search\",\n    \"name\": \"mysearch\",\n    \"target\": \"mysearch\",\n    \"request\": {\n      \"indices\": [\n        \"kibana_sample_data_flights\"\n      ],\n      \"body\": {\n        \"size\": 0,\n        \"aggregations\": {\n          \"metricAgg\": {\n            \"max\": {\n              \"field\": \"AvgTicketPrice\"\n            }\n          }\n        },\n        \"query\": {\n          \"bool\": {\n            \"filter\": {\n              \"range\": {\n                \"timestamp\": {\n                  \"gte\": \"now-1h\",\n                  \"lte\": \"now\"\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  },\n  {\n    \"type\": \"condition.script\",\n    \"name\": \"mycondition\",\n    \"source\": \"data.mysearch.aggregations.metricAgg.value > 500\"\n  }\n]",
      "actions": [
        {
          "type": "webhook",
          "name": "mywebhook",
          "throttle_period": {
            "interval": 1,
            "advInterval": "1h30m15s",
            "unit": "s"
          },
          "request": {
            "method": "POST",
            "url": "https://hooks.slack.com/services/111/111/111",
            "body": "Total: {{data.mysearch.hits.total.value}}",
            "headers": "{\n  \"Content-type\": \"application/json\"\n}"
          }
        }
      ],
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "kibana_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "max",
        "fieldName": [
          {
            "label": "AvgTicketPrice"
          }
        ],
        "topHitsAgg": {
          "field": [],
          "size": 3,
          "order": "asc"
        },
        "overDocuments": "all documents",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 500,
        "thresholdEnum": "ABOVE",
        "checksGraphResult": {
          "took": 0,
          "timed_out": false,
          "_shards": {
            "total": 1,
            "successful": 1,
            "skipped": 0,
            "failed": 0
          },
          "hits": {
            "total": {
              "value": 80,
              "relation": "eq"
            },
            "max_score": null,
            "hits": []
          },
          "aggregations": {
            "dateAgg": {
              "buckets": [
                {
                  "key_as_string": "2019-11-21T08:00:00.000+01:00",
                  "key": 1574319600000,
                  "doc_count": 8,
                  "metricAgg": {
                    "value": 817.9310302734375
                  }
                },
                {
                  "key_as_string": "2019-11-21T09:00:00.000+01:00",
                  "key": 1574323200000,
                  "doc_count": 19,
                  "metricAgg": {
                    "value": 984.7295532226562
                  }
                }
              ]
            }
          }
        },
        "checksResult": {
          "mysearch": {
            "took": 1,
            "timed_out": false,
            "_shards": {
              "total": 1,
              "successful": 1,
              "skipped": 0,
              "failed": 0
            },
            "hits": {
              "total": {
                "value": 21,
                "relation": "eq"
              },
              "max_score": null,
              "hits": []
            },
            "aggregations": {
              "metricAgg": {
                "value": 972.0838623046875
              }
            }
          }
        },
        "checksBlocks": [
          {
            "response": "",
            "check": "{\n  \"type\": \"search\",\n  \"name\": \"mysearch\",\n  \"target\": \"mysearch\",\n  \"request\": {\n    \"indices\": [\n      \"kibana_sample_data_flights\"\n    ],\n    \"body\": {\n      \"size\": 0,\n      \"aggregations\": {\n        \"metricAgg\": {\n          \"max\": {\n            \"field\": \"AvgTicketPrice\"\n          }\n        }\n      },\n      \"query\": {\n        \"bool\": {\n          \"filter\": {\n            \"range\": {\n              \"timestamp\": {\n                \"gte\": \"now-1h\",\n                \"lte\": \"now\"\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}",
            "index": 0
          },
          {
            "response": "",
            "check": "{\n  \"type\": \"condition.script\",\n  \"name\": \"mycondition\",\n  \"source\": \"data.mysearch.aggregations.metricAgg.value > 500\"\n}",
            "index": 1
          }
        ],
        "frequency": "interval",
        "period": {
          "interval": 1,
          "advInterval": "1h30m15s",
          "unit": "m"
        },
        "cron": "0 */1 * * * ?",
        "daily": 0,
        "weekly": {
          "mon": false,
          "tue": false,
          "wed": false,
          "thu": false,
          "fri": false,
          "sat": false,
          "sun": false
        },
        "monthly": {
          "type": "day",
          "day": 1
        },
        "timezone": [
          {
            "label": "Europe/Berlin"
          }
        ]
      },
      "_meta": {
        "last_edit": {
          "user": "admin",
          "date": "2019-11-21T11:44:17.803Z"
        }
      },
      "log_runtime_data": false,
      "_tenant": "admin_tenant"
    };

    const watch = {
      "active": true,
      "trigger": {
        "schedule": {
          "interval": [
            "1m"
          ],
          "timezone": "Europe/Berlin"
        }
      },
      "checks": [
        {
          "type": "search",
          "name": "mysearch",
          "target": "mysearch",
          "request": {
            "indices": [
              "kibana_sample_data_flights"
            ],
            "body": {
              "size": 0,
              "aggregations": {
                "metricAgg": {
                  "max": {
                    "field": "AvgTicketPrice"
                  }
                }
              },
              "query": {
                "bool": {
                  "filter": {
                    "range": {
                      "timestamp": {
                        "gte": "now-1h",
                        "lte": "now"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        {
          "type": "condition.script",
          "name": "mycondition",
          "source": "data.mysearch.aggregations.metricAgg.value > 500"
        }
      ],
      "actions": [
        {
          "type": "webhook",
          "name": "mywebhook",
          "request": {
            "method": "POST",
            "url": "https://hooks.slack.com/services/111/111/111",
            "body": "Total: {{data.mysearch.hits.total.value}}",
            "headers": {
              "Content-type": "application/json"
            }
          },
          "throttle_period": "1s"
        }
      ],
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "kibana_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "max",
        "fieldName": [
          {
            "label": "AvgTicketPrice"
          }
        ],
        "topHitsAgg": {
          "field": [],
          "size": 3,
          "order": "asc"
        },
        "overDocuments": "all documents",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 500,
        "thresholdEnum": "ABOVE"
      },
      "_meta": {
        "last_edit": {
          "user": "admin",
          "date": "2019-11-21T11:44:17.803Z"
        }
      },
      "log_runtime_data": false,
      "_tenant": "admin_tenant"
    };

    expect(formikToWatch(formik)).toEqual(watch);
  });

  test('formik to watch: max top_hits', () => {
    const formik = {
      "_id": "max top_hits",
      "active": true,
      "trigger": {
        "schedule": {
          "interval": [
            "1m"
          ]
        }
      },
      "checks": "[\n  {\n    \"type\": \"search\",\n    \"name\": \"mysearch\",\n    \"target\": \"mysearch\",\n    \"request\": {\n      \"indices\": [\n        \"kibana_sample_data_flights\"\n      ],\n      \"body\": {\n        \"size\": 0,\n        \"aggregations\": {\n          \"bucketAgg\": {\n            \"terms\": {\n              \"field\": \"Carrier\",\n              \"size\": 3,\n              \"order\": {\n                \"metricAgg\": \"asc\"\n              }\n            },\n            \"aggregations\": {\n              \"metricAgg\": {\n                \"max\": {\n                  \"field\": \"AvgTicketPrice\"\n                }\n              }\n            }\n          }\n        },\n        \"query\": {\n          \"bool\": {\n            \"filter\": {\n              \"range\": {\n                \"timestamp\": {\n                  \"gte\": \"now-5h\",\n                  \"lte\": \"now\"\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  },\n  {\n    \"type\": \"condition.script\",\n    \"name\": \"mycondition\",\n    \"source\": \"ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i]['metricAgg'].value > 500) { return true; } } return false;\"\n  }\n]",
      "actions": [
        {
          "type": "webhook",
          "name": "mywebhook",
          "throttle_period": {
            "interval": 1,
            "advInterval": "1h30m15s",
            "unit": "s"
          },
          "request": {
            "method": "POST",
            "url": "https://hooks.slack.com/services/111/111/111",
            "body": "Total: {{data.mysearch.hits.total.value}}",
            "headers": "{\n  \"Content-type\": \"application/json\"\n}"
          }
        }
      ],
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "kibana_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "max",
        "fieldName": [
          {
            "label": "AvgTicketPrice"
          }
        ],
        "topHitsAgg": {
          "field": [
            {
              "label": "Carrier"
            }
          ],
          "size": 3,
          "order": "asc"
        },
        "overDocuments": "top_hits",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 500,
        "thresholdEnum": "ABOVE",
        "checksGraphResult": {
          "took": 1,
          "timed_out": false,
          "_shards": {
            "total": 1,
            "successful": 1,
            "skipped": 0,
            "failed": 0
          },
          "hits": {
            "total": {
              "value": 81,
              "relation": "eq"
            },
            "max_score": null,
            "hits": []
          },
          "aggregations": {
            "bucketAgg": {
              "doc_count_error_upper_bound": 0,
              "sum_other_doc_count": 26,
              "buckets": [
                {
                  "key": "Kibana Airlines",
                  "doc_count": 22,
                  "dateAgg": {
                    "buckets": [
                      {
                        "key_as_string": "2019-11-21T08:00:00.000+01:00",
                        "key": 1574319600000,
                        "doc_count": 3,
                        "metricAgg": {
                          "value": 646.9658203125
                        }
                      },
                      {
                        "key_as_string": "2019-11-21T09:00:00.000+01:00",
                        "key": 1574323200000,
                        "doc_count": 9,
                        "metricAgg": {
                          "value": 869.2964477539062
                        }
                      }
                    ]
                  },
                  "metricAgg": {
                    "value": 903.0375366210938
                  }
                },
                {
                  "key": "Logstash Airways",
                  "doc_count": 19,
                  "dateAgg": {
                    "buckets": [
                      {
                        "key_as_string": "2019-11-21T08:00:00.000+01:00",
                        "key": 1574319600000,
                        "doc_count": 1,
                        "metricAgg": {
                          "value": 105.32759094238281
                        }
                      },
                      {
                        "key_as_string": "2019-11-21T09:00:00.000+01:00",
                        "key": 1574323200000,
                        "doc_count": 3,
                        "metricAgg": {
                          "value": 840.295654296875
                        }
                      }
                    ]
                  },
                  "metricAgg": {
                    "value": 972.0838623046875
                  }
                },
                {
                  "key": "JetBeats",
                  "doc_count": 14,
                  "dateAgg": {
                    "buckets": [
                      {
                        "key_as_string": "2019-11-21T08:00:00.000+01:00",
                        "key": 1574319600000,
                        "doc_count": 1,
                        "metricAgg": {
                          "value": 665.5465087890625
                        }
                      },
                      {
                        "key_as_string": "2019-11-21T09:00:00.000+01:00",
                        "key": 1574323200000,
                        "doc_count": 1,
                        "metricAgg": {
                          "value": 701.49658203125
                        }
                      }
                    ]
                  },
                  "metricAgg": {
                    "value": 993.6041259765625
                  }
                }
              ]
            }
          }
        },
        "checksResult": {
          "mysearch": {
            "took": 1,
            "timed_out": false,
            "_shards": {
              "total": 1,
              "successful": 1,
              "skipped": 0,
              "failed": 0
            },
            "hits": {
              "total": {
                "value": 81,
                "relation": "eq"
              },
              "max_score": null,
              "hits": []
            },
            "aggregations": {
              "bucketAgg": {
                "doc_count_error_upper_bound": 0,
                "sum_other_doc_count": 26,
                "buckets": [
                  {
                    "key": "Kibana Airlines",
                    "doc_count": 22,
                    "metricAgg": {
                      "value": 903.0375366210938
                    }
                  },
                  {
                    "key": "Logstash Airways",
                    "doc_count": 19,
                    "metricAgg": {
                      "value": 972.0838623046875
                    }
                  },
                  {
                    "key": "JetBeats",
                    "doc_count": 14,
                    "metricAgg": {
                      "value": 993.6041259765625
                    }
                  }
                ]
              }
            }
          }
        },
        "checksBlocks": [
          {
            "response": "",
            "check": "{\n  \"type\": \"search\",\n  \"name\": \"mysearch\",\n  \"target\": \"mysearch\",\n  \"request\": {\n    \"indices\": [\n      \"kibana_sample_data_flights\"\n    ],\n    \"body\": {\n      \"size\": 0,\n      \"aggregations\": {\n        \"bucketAgg\": {\n          \"terms\": {\n            \"field\": \"Carrier\",\n            \"size\": 3,\n            \"order\": {\n              \"metricAgg\": \"asc\"\n            }\n          },\n          \"aggregations\": {\n            \"metricAgg\": {\n              \"max\": {\n                \"field\": \"AvgTicketPrice\"\n              }\n            }\n          }\n        }\n      },\n      \"query\": {\n        \"bool\": {\n          \"filter\": {\n            \"range\": {\n              \"timestamp\": {\n                \"gte\": \"now-5h\",\n                \"lte\": \"now\"\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}",
            "index": 0
          },
          {
            "response": "",
            "check": "{\n  \"type\": \"condition.script\",\n  \"name\": \"mycondition\",\n  \"source\": \"ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i]['metricAgg'].value > 500) { return true; } } return false;\"\n}",
            "index": 1
          }
        ],
        "frequency": "interval",
        "period": {
          "interval": 1,
          "advInterval": "1h30m15s",
          "unit": "m"
        },
        "cron": "0 */1 * * * ?",
        "daily": 0,
        "weekly": {
          "mon": false,
          "tue": false,
          "wed": false,
          "thu": false,
          "fri": false,
          "sat": false,
          "sun": false
        },
        "monthly": {
          "type": "day",
          "day": 1
        },
        "timezone": [
          {
            "label": "Europe/Berlin"
          }
        ]
      },
      "_meta": {
        "last_edit": {
          "user": "admin",
          "date": "2019-11-21T12:18:29.624Z"
        }
      },
      "log_runtime_data": false,
      "_tenant": "admin_tenant"
    };

    const watch = {
      "active": true,
      "trigger": {
        "schedule": {
          "interval": [
            "1m"
          ],
          "timezone": "Europe/Berlin"
        }
      },
      "checks": [
        {
          "type": "search",
          "name": "mysearch",
          "target": "mysearch",
          "request": {
            "indices": [
              "kibana_sample_data_flights"
            ],
            "body": {
              "size": 0,
              "aggregations": {
                "bucketAgg": {
                  "terms": {
                    "field": "Carrier",
                    "size": 3,
                    "order": {
                      "metricAgg": "asc"
                    }
                  },
                  "aggregations": {
                    "metricAgg": {
                      "max": {
                        "field": "AvgTicketPrice"
                      }
                    }
                  }
                }
              },
              "query": {
                "bool": {
                  "filter": {
                    "range": {
                      "timestamp": {
                        "gte": "now-5h",
                        "lte": "now"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        {
          "type": "condition.script",
          "name": "mycondition",
          "source": "ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i]['metricAgg'].value > 500) { return true; } } return false;"
        }
      ],
      "actions": [
        {
          "type": "webhook",
          "name": "mywebhook",
          "request": {
            "method": "POST",
            "url": "https://hooks.slack.com/services/111/111/111",
            "body": "Total: {{data.mysearch.hits.total.value}}",
            "headers": {
              "Content-type": "application/json"
            }
          },
          "throttle_period": "1s"
        }
      ],
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "kibana_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "max",
        "fieldName": [
          {
            "label": "AvgTicketPrice"
          }
        ],
        "topHitsAgg": {
          "field": [
            {
              "label": "Carrier"
            }
          ],
          "size": 3,
          "order": "asc"
        },
        "overDocuments": "top_hits",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 500,
        "thresholdEnum": "ABOVE"
      },
      "_meta": {
        "last_edit": {
          "user": "admin",
          "date": "2019-11-21T12:18:29.624Z"
        }
      },
      "log_runtime_data": false,
      "_tenant": "admin_tenant"
    };

    expect(formikToWatch(formik)).toEqual(watch);
  });

  test('formik to watch: watch created by API (Json watch)', () => {
    const formik = {
      "_id": "watch_created_by_api",
      "active": true,
      "trigger": {
        "schedule": {
          "timezone": "Europe/Rome",
          "cron": [
            "0 0/30 * * * ?"
          ]
        }
      },
      "checks": "[\n  {\n    \"type\": \"search\",\n    \"name\": \"testsearch\",\n    \"target\": \"testsearch\",\n    \"request\": {\n      \"indices\": [\n        \"kibana_sample_data_ecommerce\"\n      ],\n      \"body\": {\n        \"from\": 0,\n        \"size\": 10,\n        \"query\": {\n          \"range\": {\n            \"taxful_total_price\": {\n              \"gte\": 100\n            }\n          }\n        }\n      }\n    }\n  },\n  {\n    \"type\": \"condition.script\",\n    \"name\": \"testcondition\",\n    \"source\": \"ctx.testsearch.hits.hits.length > 0\"\n  }\n]",
      "actions": [
        {
          "type": "index",
          "name": "my_index",
          "throttle_period": {
            "interval": 1,
            "advInterval": "1h30m15s",
            "unit": "m"
          },
          "index": [
            {
              "label": "testsink"
            }
          ],
          "checks": "[]"
        },
        {
          "type": "webhook",
          "name": "my_webhook",
          "throttle_period": {
            "interval": 1,
            "advInterval": "1h30m15s",
            "unit": "m"
          },
          "request": {
            "method": "POST",
            "url": "https://hooks.slack.com/services/111/111/111",
            "body": "{\"text\": \"Goods total: {{testsearch.hits.total.value}}\", \"attachments\": [{\"title\": \"First 10 customers\", \"text\": \"{{#testsearch.hits.hits}}{{#_source}}_{{customer_full_name}}_, {{email}}, *price: {{taxful_total_price}}*, {{/_source}}{{/testsearch.hits.hits}}\"}]}",
            "headers": "{\n  \"Content-type\": \"application/json\"\n}"
          }
        }
      ],
      "_ui": {
        "watchType": "json",
        "index": [],
        "timeField": "",
        "aggregationType": "count",
        "fieldName": [],
        "topHitsAgg": {
          "field": [],
          "size": 3,
          "order": "asc"
        },
        "overDocuments": "all documents",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 1000,
        "thresholdEnum": "ABOVE",
        "checksGraphResult": {},
        "checksResult": "",
        "checksBlocks": [
          {
            "response": "",
            "check": "{\n  \"type\": \"search\",\n  \"name\": \"testsearch\",\n  \"target\": \"testsearch\",\n  \"request\": {\n    \"indices\": [\n      \"kibana_sample_data_ecommerce\"\n    ],\n    \"body\": {\n      \"from\": 0,\n      \"size\": 10,\n      \"query\": {\n        \"range\": {\n          \"taxful_total_price\": {\n            \"gte\": 100\n          }\n        }\n      }\n    }\n  }\n}",
            "index": 0
          },
          {
            "response": "",
            "check": "{\n  \"type\": \"condition.script\",\n  \"name\": \"testcondition\",\n  \"source\": \"ctx.testsearch.hits.hits.length > 0\"\n}",
            "index": 1
          }
        ],
        "frequency": "cron",
        "period": {
          "interval": 1,
          "advInterval": "1h30m15s",
          "unit": "m"
        },
        "cron": "0 0/30 * * * ?",
        "daily": 0,
        "weekly": {
          "mon": false,
          "tue": false,
          "wed": false,
          "thu": false,
          "fri": false,
          "sat": false,
          "sun": false
        },
        "monthly": {
          "type": "day",
          "day": 1
        },
        "timezone": [
          {
            "label": "Europe/Rome"
          }
        ]
      },
      "_meta": {
        "last_edit": {
          "user": "admin",
          "date": "2019-11-21T12:19:51.532Z"
        }
      },
      "log_runtime_data": false,
      "_tenant": "admin_tenant"
    };

    const watch = {
      "active": true,
      "trigger": {
        "schedule": {
          "cron": [
            "0 0/30 * * * ?"
          ],
          "timezone": "Europe/Rome"
        }
      },
      "checks": [
        {
          "type": "search",
          "name": "testsearch",
          "target": "testsearch",
          "request": {
            "indices": [
              "kibana_sample_data_ecommerce"
            ],
            "body": {
              "from": 0,
              "size": 10,
              "query": {
                "range": {
                  "taxful_total_price": {
                    "gte": 100
                  }
                }
              }
            }
          }
        },
        {
          "type": "condition.script",
          "name": "testcondition",
          "source": "ctx.testsearch.hits.hits.length > 0"
        }
      ],
      "actions": [
        {
          "type": "index",
          "name": "my_index",
          "index": "testsink",
          "checks": [],
          "throttle_period": "1m"
        },
        {
          "type": "webhook",
          "name": "my_webhook",
          "request": {
            "method": "POST",
            "url": "https://hooks.slack.com/services/111/111/111",
            "body": "{\"text\": \"Goods total: {{testsearch.hits.total.value}}\", \"attachments\": [{\"title\": \"First 10 customers\", \"text\": \"{{#testsearch.hits.hits}}{{#_source}}_{{customer_full_name}}_, {{email}}, *price: {{taxful_total_price}}*, {{/_source}}{{/testsearch.hits.hits}}\"}]}",
            "headers": {
              "Content-type": "application/json"
            }
          },
          "throttle_period": "1m"
        }
      ],
      "_ui": {
        "watchType": "json",
        "index": [],
        "timeField": "",
        "aggregationType": "count",
        "fieldName": [],
        "topHitsAgg": {
          "field": [],
          "size": 3,
          "order": "asc"
        },
        "overDocuments": "all documents",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 1000,
        "thresholdEnum": "ABOVE"
      },
      "_meta": {
        "last_edit": {
          "user": "admin",
          "date": "2019-11-21T12:19:51.532Z"
        }
      },
      "log_runtime_data": false,
      "_tenant": "admin_tenant"
    };

    expect(formikToWatch(formik)).toEqual(watch);
  });

  test('formik to watch: Blocks watch', () => {
    const formik = {
      "_id": "check blocks",
      "active": true,
      "trigger": {
        "schedule": {
          "timezone": "Europe/Rome",
          "cron": [
            "0 0/30 * * * ?"
          ]
        }
      },
      "checks": "[\n  {\n    \"type\": \"search\",\n    \"name\": \"testsearch\",\n    \"target\": \"testsearch\",\n    \"request\": {\n      \"indices\": [\n        \"kibana_sample_data_ecommerce\"\n      ],\n      \"body\": {\n        \"from\": 0,\n        \"size\": 10,\n        \"query\": {\n          \"range\": {\n            \"taxful_total_price\": {\n              \"gte\": 100\n            }\n          }\n        }\n      }\n    }\n  },\n  {\n    \"type\": \"condition.script\",\n    \"name\": \"testcondition\",\n    \"source\": \"ctx.testsearch.hits.hits.length > 0\"\n  }\n]",
      "actions": [
        {
          "type": "index",
          "name": "my_index",
          "throttle_period": {
            "interval": 1,
            "advInterval": "1h30m15s",
            "unit": "m"
          },
          "index": [
            {
              "label": "testsink"
            }
          ],
          "checks": "[]"
        },
        {
          "type": "webhook",
          "name": "my_webhook",
          "throttle_period": {
            "interval": 1,
            "advInterval": "1h30m15s",
            "unit": "m"
          },
          "request": {
            "method": "POST",
            "url": "https://hooks.slack.com/services/111/111/111",
            "body": "{\"text\": \"Goods total: {{testsearch.hits.total.value}}\", \"attachments\": [{\"title\": \"First 10 customers\", \"text\": \"{{#testsearch.hits.hits}}{{#_source}}_{{customer_full_name}}_, {{email}}, *price: {{taxful_total_price}}*, {{/_source}}{{/testsearch.hits.hits}}\"}]}",
            "headers": "{\n  \"Content-type\": \"application/json\"\n}"
          }
        }
      ],
      "_ui": {
        "watchType": "blocks",
        "index": [],
        "timeField": "",
        "aggregationType": "count",
        "fieldName": [],
        "topHitsAgg": {
          "field": [],
          "size": 3,
          "order": "asc"
        },
        "overDocuments": "all documents",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 1000,
        "thresholdEnum": "ABOVE",
        "checksGraphResult": {},
        "checksResult": "",
        "checksBlocks": [
          {
            "response": "",
            "check": "{\n  \"type\": \"search\",\n  \"name\": \"testsearch\",\n  \"target\": \"testsearch\",\n  \"request\": {\n    \"indices\": [\n      \"kibana_sample_data_ecommerce\"\n    ],\n    \"body\": {\n      \"from\": 0,\n      \"size\": 10,\n      \"query\": {\n        \"range\": {\n          \"taxful_total_price\": {\n            \"gte\": 100\n          }\n        }\n      }\n    }\n  }\n}",
            "index": 0
          },
          {
            "response": "",
            "check": "{\n  \"type\": \"condition.script\",\n  \"name\": \"testcondition\",\n  \"source\": \"ctx.testsearch.hits.hits.length > 0\"\n}",
            "index": 1
          }
        ],
        "frequency": "cron",
        "period": {
          "interval": 1,
          "advInterval": "1h30m15s",
          "unit": "m"
        },
        "cron": "0 0/30 * * * ?",
        "daily": 0,
        "weekly": {
          "mon": false,
          "tue": false,
          "wed": false,
          "thu": false,
          "fri": false,
          "sat": false,
          "sun": false
        },
        "monthly": {
          "type": "day",
          "day": 1
        },
        "timezone": [
          {
            "label": "Europe/Rome"
          }
        ]
      },
      "_meta": {
        "last_edit": {
          "user": "admin",
          "date": "2019-11-21T12:00:50.281Z"
        }
      },
      "log_runtime_data": false,
      "_tenant": "admin_tenant"
    };

    const watch = {
      "active": true,
      "trigger": {
        "schedule": {
          "cron": [
            "0 0/30 * * * ?"
          ],
          "timezone": "Europe/Rome"
        }
      },
      "checks": [
        {
          "type": "search",
          "name": "testsearch",
          "target": "testsearch",
          "request": {
            "indices": [
              "kibana_sample_data_ecommerce"
            ],
            "body": {
              "from": 0,
              "size": 10,
              "query": {
                "range": {
                  "taxful_total_price": {
                    "gte": 100
                  }
                }
              }
            }
          }
        },
        {
          "type": "condition.script",
          "name": "testcondition",
          "source": "ctx.testsearch.hits.hits.length > 0"
        }
      ],
      "actions": [
        {
          "type": "index",
          "name": "my_index",
          "index": "testsink",
          "checks": [],
          "throttle_period": "1m"
        },
        {
          "type": "webhook",
          "name": "my_webhook",
          "request": {
            "method": "POST",
            "url": "https://hooks.slack.com/services/111/111/111",
            "body": "{\"text\": \"Goods total: {{testsearch.hits.total.value}}\", \"attachments\": [{\"title\": \"First 10 customers\", \"text\": \"{{#testsearch.hits.hits}}{{#_source}}_{{customer_full_name}}_, {{email}}, *price: {{taxful_total_price}}*, {{/_source}}{{/testsearch.hits.hits}}\"}]}",
            "headers": {
              "Content-type": "application/json"
            }
          },
          "throttle_period": "1m"
        }
      ],
      "_ui": {
        "watchType": "blocks",
        "index": [],
        "timeField": "",
        "aggregationType": "count",
        "fieldName": [],
        "topHitsAgg": {
          "field": [],
          "size": 3,
          "order": "asc"
        },
        "overDocuments": "all documents",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 1000,
        "thresholdEnum": "ABOVE"
      },
      "_meta": {
        "last_edit": {
          "user": "admin",
          "date": "2019-11-21T12:00:50.281Z"
        }
      },
      "log_runtime_data": false,
      "_tenant": "admin_tenant"
    };

    expect(formikToWatch(formik)).toEqual(watch);
  });
});
