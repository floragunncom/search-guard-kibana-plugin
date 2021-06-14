/* eslint-disable @kbn/eslint/require-license-header */
/* eslint-disable max-len */
import {
  watchToFormik,
  buildFormikChecks,
  buildFormikChecksBlocks,
  buildFormikMeta,
  buildFormikActions,
  buildFormikSeverity,
} from './watchToFormik';
import { stringifyPretty } from '../../../utils/helpers';
import {
  WATCH_TYPES,
  SCHEDULE_DEFAULTS,
  GRAPH_DEFAULTS,
  RESULT_FIELD_DEFAULTS,
  SEVERITY,
  SEVERITY_COLORS,
} from './constants';
import { ACTION_TYPE } from '../components/ActionPanel/utils/constants';

describe('buildFormikSeverity', () => {
  test('can build formik severity if it is disabled', () => {
    const watch = {
      actions: [
        {
          name: 'slack',
        },
        {
          name: 'email',
        },
      ],
    };

    const formik = {
      _ui: {
        isSeverity: false,
        isResolveActions: false,
        severity: {
          value: [],
          valueString: '',
          order: 'ascending',
          thresholds: {
            info: 100,
            warning: 200,
            error: 300,
            critical: 400,
          },
        },
      },
      actions: [
        {
          name: 'slack',
          severity: [],
        },
        {
          name: 'email',
          severity: [],
        },
      ],
      resolve_actions: [],
    };

    expect(buildFormikSeverity(watch)).toEqual(formik);
  });

  test('can build formik severity if it was addes via API', () => {
    const watch = {
      severity: {
        value: 'afield',
        order: 'descending',
        mapping: [
          {
            threshold: 4000,
            level: SEVERITY.CRITICAL,
          },
        ],
      },
      actions: [
        {
          name: 'email',
          severity: [SEVERITY.CRITICAL],
        },
      ],
    };

    const formik = {
      _ui: {
        isSeverity: true,
        isResolveActions: false,
        severity: {
          value: [{ label: 'afield' }],
          valueString: 'afield',
          order: 'descending',
          thresholds: {
            info: 0,
            warning: 0,
            error: 0,
            critical: 4000,
          },
        },
      },
      severity: {
        value: 'afield',
        order: 'descending',
        mapping: [
          {
            threshold: 4000,
            level: SEVERITY.CRITICAL,
          },
        ],
      },
      actions: [
        {
          name: 'email',
          severity: [{ label: SEVERITY.CRITICAL, color: SEVERITY_COLORS.critical }],
        },
      ],
      resolve_actions: [],
    };

    expect(buildFormikSeverity(watch)).toEqual(formik);
  });

  test('can build formik severity if it is enabled', () => {
    const watch = {
      _ui: {
        isSeverity: true,
        isResolveActions: false,
        severity: {
          value: [{ label: 'afield' }],
          valueString: 'afield',
          order: 'descending',
          thresholds: {
            warning: '',
            error: 0,
            critical: 4000,
          },
        },
      },
      severity: {
        value: 'afield',
        order: 'descending',
        mapping: [
          {
            threshold: 4000,
            level: SEVERITY.CRITICAL,
          },
        ],
      },
      actions: [
        {
          name: 'email',
          severity: [SEVERITY.CRITICAL],
        },
      ],
    };

    const formik = {
      _ui: {
        isSeverity: true,
        isResolveActions: false,
        severity: {
          value: [{ label: 'afield' }],
          valueString: 'afield',
          order: 'descending',
          thresholds: {
            info: 0,
            warning: 0,
            error: 0,
            critical: 4000,
          },
        },
      },
      severity: {
        value: 'afield',
        order: 'descending',
        mapping: [
          {
            threshold: 4000,
            level: SEVERITY.CRITICAL,
          },
        ],
      },
      actions: [
        {
          name: 'email',
          severity: [{ label: SEVERITY.CRITICAL, color: SEVERITY_COLORS.critical }],
        },
      ],
      resolve_actions: [],
    };

    expect(buildFormikSeverity(watch)).toEqual(formik);
  });

  test('can build formik severity if resolve_actions', () => {
    const watch = {
      severity: {
        value: 'afield',
        order: 'descending',
        mapping: [
          {
            threshold: 4000,
            level: SEVERITY.CRITICAL,
          },
        ],
      },
      actions: [
        {
          name: 'email',
          severity: [SEVERITY.CRITICAL],
        },
      ],
      resolve_actions: [
        {
          name: 'email',
          resolves_severity: [SEVERITY.CRITICAL],
        },
      ],
    };

    const formik = {
      _ui: {
        isSeverity: true,
        isResolveActions: true,
        severity: {
          value: [{ label: 'afield' }],
          valueString: 'afield',
          order: 'descending',
          thresholds: {
            info: 0,
            warning: 0,
            error: 0,
            critical: 4000,
          },
        },
      },
      severity: {
        value: 'afield',
        order: 'descending',
        mapping: [
          {
            threshold: 4000,
            level: SEVERITY.CRITICAL,
          },
        ],
      },
      actions: [
        {
          name: 'email',
          severity: [{ label: SEVERITY.CRITICAL, color: SEVERITY_COLORS.critical }],
        },
      ],
      resolve_actions: [
        {
          name: 'email',
          resolves_severity: [{ label: SEVERITY.CRITICAL, color: SEVERITY_COLORS.critical }],
        },
      ],
    };

    expect(buildFormikSeverity(watch)).toEqual(formik);
  });
});

describe('buildFormikActions', () => {
  test('can build email formik action and resolve_actions', () => {
    const actions = [
      {
        severity: ['critical'],
        throttle_period: '1s',
        type: ACTION_TYPE.EMAIL,
        name: 'myemail',
        from: 'signals@localhost',
        to: ['a', 'b'],
        cc: ['a', 'b'],
        bcc: ['a', 'b'],
        subject: 'a',
        text_body: 'Total: {{data.mysearch.hits.total.value}}',
        account: 'a',
      },
    ];

    const resolveActions = [
      {
        resolves_severity: ['critical'],
        type: ACTION_TYPE.EMAIL,
        name: 'myemail',
        from: 'signals@localhost',
        to: ['a', 'b'],
        cc: ['a', 'b'],
        bcc: ['a', 'b'],
        subject: 'a',
        text_body: 'Total: {{data.mysearch.hits.total.value}}',
        account: 'a',
      },
    ];

    const formik = {
      actions: [
        {
          checks: '[]',
          checksBlocks: [],
          severity: ['critical'],
          throttle_period: {
            advInterval: SCHEDULE_DEFAULTS.period.advInterval,
            interval: 1,
            unit: 's',
          },
          type: ACTION_TYPE.EMAIL,
          name: 'myemail',
          from: 'signals@localhost',
          to: [{ label: 'a' }, { label: 'b' }],
          cc: [{ label: 'a' }, { label: 'b' }],
          bcc: [{ label: 'a' }, { label: 'b' }],
          subject: 'a',
          text_body: 'Total: {{data.mysearch.hits.total.value}}',
          html_body: `<p>
  <span style="color:blue;">Total:</span>
  <span style="color:red;">{{data.avg_ticket_price.aggregations.metricAgg.value}}</span>
</p>
`,
          account: [{ label: 'a' }],
        },
      ],
      resolve_actions: [
        {
          checks: '[]',
          checksBlocks: [],
          resolves_severity: ['critical'],
          type: ACTION_TYPE.EMAIL,
          name: 'myemail',
          from: 'signals@localhost',
          to: [{ label: 'a' }, { label: 'b' }],
          cc: [{ label: 'a' }, { label: 'b' }],
          bcc: [{ label: 'a' }, { label: 'b' }],
          subject: 'a',
          text_body: 'Total: {{data.mysearch.hits.total.value}}',
          html_body: `<p>
  <span style="color:blue;">Total:</span>
  <span style="color:red;">{{data.avg_ticket_price.aggregations.metricAgg.value}}</span>
</p>
`,
          account: [{ label: 'a' }],
        },
      ],
    };

    expect(buildFormikActions({ actions, resolve_actions: resolveActions })).toEqual(formik);
  });

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
        account: 'a',
      },
    ];

    const formik = {
      actions: [
        {
          checks: '[]',
          checksBlocks: [],
          severity: [],
          throttle_period: {
            advInterval: SCHEDULE_DEFAULTS.period.advInterval,
            interval: 1,
            unit: 's',
          },
          type: ACTION_TYPE.EMAIL,
          name: 'myemail',
          from: 'signals@localhost',
          to: [{ label: 'a' }, { label: 'b' }],
          cc: [{ label: 'a' }, { label: 'b' }],
          bcc: [{ label: 'a' }, { label: 'b' }],
          subject: 'a',
          text_body: 'Total: {{data.mysearch.hits.total.value}}',
          html_body: `<p>
  <span style="color:blue;">Total:</span>
  <span style="color:red;">{{data.avg_ticket_price.aggregations.metricAgg.value}}</span>
</p>
`,
          account: [{ label: 'a' }],
        },
      ],
      resolve_actions: [],
    };

    expect(buildFormikActions({ actions })).toEqual(formik);
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
        icon_emoji: ':got:',
      },
    ];

    const formik = {
      actions: [
        {
          checks: '[]',
          checksBlocks: [],
          throttle_period: {
            advInterval: SCHEDULE_DEFAULTS.period.advInterval,
            interval: 1,
            unit: 's',
          },
          type: ACTION_TYPE.SLACK,
          severity: [],
          name: 'myslacksink',
          account: [{ label: 'a' }],
          from: 'signals',
          text: 'Total: {{data.mysearch.hits.total.value}}',
          icon_emoji: ':got:',
        },
      ],
      resolve_actions: [],
    };

    expect(buildFormikActions({ actions })).toEqual(formik);
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
            'Content-type': 'application/json',
          },
        },
      },
    ];

    const formik = {
      actions: [
        {
          checks: '[]',
          checksBlocks: [],
          severity: [],
          throttle_period: {
            advInterval: SCHEDULE_DEFAULTS.period.advInterval,
            interval: 1,
            unit: 's',
          },
          type: ACTION_TYPE.WEBHOOK,
          name: 'mywebhook',
          request: {
            method: 'POST',
            url: 'http://url.com',
            body: 'Total: {{data.mysearch.hits.total.value}}',
            headers: stringifyPretty({ 'Content-type': 'application/json' }),
          },
        },
      ],
      resolve_actions: [],
    };

    expect(buildFormikActions({ actions })).toEqual(formik);
  });

  test('can build index formik action', () => {
    const actions = [
      {
        throttle_period: '1s',
        type: ACTION_TYPE.INDEX,
        name: 'myelasticsearch',
        index: 'a',
        checks: [
          {
            type: 'static',
            target: 'myconstants',
            value: {
              threshold: 10,
            },
          },
        ],
      },
    ];

    const formik = {
      actions: [
        {
          throttle_period: {
            advInterval: SCHEDULE_DEFAULTS.period.advInterval,
            interval: 1,
            unit: 's',
          },
          type: ACTION_TYPE.INDEX,
          name: 'myelasticsearch',
          index: [{ label: 'a' }],
          checks: stringifyPretty([
            {
              type: 'static',
              target: 'myconstants',
              value: {
                threshold: 10,
              },
            },
          ]),
          checksBlocks: [
            {
              type: 'static',
              name: '',
              target: 'myconstants',
              value: stringifyPretty({
                threshold: 10,
              }),
              response: '',
              id: expect.any(String),
            },
          ],
        },
      ],
      resolve_actions: [],
    };

    expect(buildFormikActions({ actions })).toEqual(formik);
  });
});

describe('buildFormikChecksBlocks', () => {
  test('can create checks blocks formik', () => {
    const checks = [
      {
        type: 'static',
        target: 'myconstants',
        value: {
          threshold: 10,
          time_period: '10s',
          admin_lastname: 'Anderson',
          admin_firstname: 'Paul',
        },
      },
      {
        type: 'search',
        target: 'auditlog',
        request: {
          indices: ['audit*'],
          body: {
            size: 5,
            query: {},
            aggs: {},
          },
        },
      },
    ];

    const formikChecks = [
      {
        type: 'static',
        name: '',
        target: 'myconstants',
        value: stringifyPretty({
          threshold: 10,
          time_period: '10s',
          admin_lastname: 'Anderson',
          admin_firstname: 'Paul',
        }),
        response: '',
        id: expect.any(String),
      },
      {
        type: 'search',
        name: '',
        target: 'auditlog',
        request: {
          indices: [{ label: 'audit*' }],
          body: stringifyPretty({
            size: 5,
            query: {},
            aggs: {},
          }),
        },
        response: '',
        id: expect.any(String),
      },
    ];

    expect(buildFormikChecksBlocks(checks)).toEqual(formikChecks);
  });
});

describe('buildFormikChecks', () => {
  test('can create checks formik', () => {
    const checks = [{ name: 'mySearch', value: { a: 1 } }];

    expect(buildFormikChecks(checks)).toEqual(stringifyPretty(checks));
  });
});

describe('watchToFormik', () => {
  test('watch to formik: count all docs', () => {
    const watch = {
      _ui: {
        aggregationType: 'count',
        fieldName: [],
        bucketValue: 1,
        timeField: 'timestamp',
        index: [
          {
            health: 'green',
            label: 'kibana_sample_data_flights',
            status: 'open',
          },
        ],
        thresholdValue: 10,
        watchType: 'graph',
        topHitsAgg: {
          field: [],
          size: 3,
          order: 'asc',
        },
        overDocuments: 'all documents',
        bucketUnitOfTime: 'h',
        thresholdEnum: 'ABOVE',
      },
      checks: [
        {
          type: 'search',
          name: 'mysearch',
          target: 'mysearch',
          request: {
            indices: ['kibana_sample_data_flights'],
            body: {
              size: 0,
              aggregations: {},
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
            },
          },
        },
        {
          type: 'condition',
          name: 'mycondition',
          source: 'data.mysearch.hits.total.value > 10',
        },
      ],
      active: true,
      _meta: {
        last_edit: {
          user: 'admin',
          date: '2019-11-21T10:34:54.013Z',
        },
      },
      trigger: {
        schedule: {
          interval: ['1m'],
        },
      },
      log_runtime_data: false,
      _tenant: 'admin_tenant',
      actions: [
        {
          type: 'webhook',
          name: 'mywebhook',
          throttle_period: '1s',
          request: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/111/111/111',
            body: 'Total: {{data.mysearch.hits.total.value}}',
            headers: {
              'Content-type': 'application/json',
            },
          },
        },
      ],
      _id: 'count all docs',
    };

    const formik = {
      _id: 'count all docs',
      active: true,
      trigger: {
        schedule: {
          interval: ['1m'],
        },
      },
      checks:
        '[\n  {\n    "type": "search",\n    "name": "mysearch",\n    "target": "mysearch",\n    "request": {\n      "indices": [\n        "kibana_sample_data_flights"\n      ],\n      "body": {\n        "size": 0,\n        "aggregations": {},\n        "query": {\n          "bool": {\n            "filter": {\n              "range": {\n                "timestamp": {\n                  "gte": "now-1h",\n                  "lte": "now"\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  },\n  {\n    "type": "condition",\n    "name": "mycondition",\n    "source": "data.mysearch.hits.total.value > 10"\n  }\n]',
      resolve_actions: [],
      actions: [
        {
          checks: '[]',
          checksBlocks: [],
          type: 'webhook',
          name: 'mywebhook',
          throttle_period: {
            interval: 1,
            advInterval: '1h30m15s',
            unit: 's',
          },
          severity: [],
          request: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/111/111/111',
            body: 'Total: {{data.mysearch.hits.total.value}}',
            headers: '{\n  "Content-type": "application/json"\n}',
          },
        },
      ],
      _ui: {
        isSeverity: false,
        isResolveActions: false,
        severity: {
          value: [],
          valueString: '',
          order: 'ascending',
          thresholds: {
            info: 100,
            warning: 200,
            error: 300,
            critical: 400,
          },
        },
        watchType: 'graph',
        index: [
          {
            health: 'green',
            label: 'kibana_sample_data_flights',
            status: 'open',
          },
        ],
        timeField: 'timestamp',
        aggregationType: 'count',
        fieldName: [],
        topHitsAgg: {
          field: [],
          size: 3,
          order: 'asc',
        },
        overDocuments: 'all documents',
        bucketValue: 1,
        bucketUnitOfTime: 'h',
        thresholdValue: 10,
        thresholdEnum: 'ABOVE',
        checksGraphResult: {},
        checksResult: '',
        checksBlocks: [
          {
            type: 'search',
            name: 'mysearch',
            target: 'mysearch',
            request: {
              indices: [{ label: 'kibana_sample_data_flights' }],
              body: stringifyPretty({
                size: 0,
                aggregations: {},
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
              }),
            },
            response: '',
            id: expect.any(String),
          },
          {
            type: 'condition',
            name: 'mycondition',
            target: '',
            source: 'data.mysearch.hits.total.value > 10',
            lang: 'painless',
            response: '',
            id: expect.any(String),
          },
        ],
        frequency: 'interval',
        hourly: [
          {
            label: '1',
          },
        ],
        period: {
          interval: 1,
          advInterval: '1h30m15s',
          unit: 'm',
        },
        cron: '0 */1 * * * ?',
        daily: 0,
        weekly: {
          mon: false,
          tue: false,
          wed: false,
          thu: false,
          fri: false,
          sat: false,
          sun: false,
        },
        monthly: {
          type: 'day',
          day: 1,
        },
        timezone: [
          {
            label: 'Europe/Berlin',
          },
        ],
      },
      _meta: {
        last_edit: {
          user: 'admin',
          date: '2019-11-21T10:34:54.013Z',
        },
      },
      log_runtime_data: false,
      _tenant: 'admin_tenant',
    };

    expect(watchToFormik(watch)).toEqual(formik);
  });

  test('watch to formik: count top_hits', () => {
    const watch = {
      _ui: {
        aggregationType: 'count',
        fieldName: [],
        bucketValue: 1,
        timeField: 'timestamp',
        index: [
          {
            health: 'green',
            label: 'kibana_sample_data_flights',
            status: 'open',
          },
        ],
        thresholdValue: 100,
        watchType: 'graph',
        topHitsAgg: {
          field: [
            {
              label: 'Carrier',
            },
          ],
          size: 3,
          order: 'asc',
        },
        overDocuments: 'top_hits',
        bucketUnitOfTime: 'h',
        thresholdEnum: 'ABOVE',
      },
      checks: [
        {
          type: 'search',
          name: 'mysearch',
          target: 'mysearch',
          request: {
            indices: ['kibana_sample_data_flights'],
            body: {
              size: 0,
              aggregations: {
                bucketAgg: {
                  terms: {
                    field: 'Carrier',
                    size: 3,
                    order: {
                      _count: 'asc',
                    },
                  },
                },
              },
              query: {
                bool: {
                  filter: {
                    range: {
                      timestamp: {
                        gte: 'now-5h',
                        lte: 'now',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        {
          type: 'condition',
          name: 'mycondition',
          source:
            'ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i].doc_count > 100) { return true; } } return false;',
        },
      ],
      active: true,
      _meta: {
        last_edit: {
          user: 'admin',
          date: '2019-11-21T11:26:54.752Z',
        },
      },
      trigger: {
        schedule: {
          interval: ['1m'],
        },
      },
      log_runtime_data: false,
      _tenant: 'admin_tenant',
      actions: [
        {
          type: 'webhook',
          name: 'mywebhook',
          throttle_period: '1s',
          request: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/111/111/111',
            body: 'Total: {{data.mysearch.hits.total.value}}',
            headers: {
              'Content-type': 'application/json',
            },
          },
        },
      ],
      _id: 'count top_hits',
    };

    const formik = {
      _id: 'count top_hits',
      active: true,
      trigger: {
        schedule: {
          interval: ['1m'],
        },
      },
      checks:
        '[\n  {\n    "type": "search",\n    "name": "mysearch",\n    "target": "mysearch",\n    "request": {\n      "indices": [\n        "kibana_sample_data_flights"\n      ],\n      "body": {\n        "size": 0,\n        "aggregations": {\n          "bucketAgg": {\n            "terms": {\n              "field": "Carrier",\n              "size": 3,\n              "order": {\n                "_count": "asc"\n              }\n            }\n          }\n        },\n        "query": {\n          "bool": {\n            "filter": {\n              "range": {\n                "timestamp": {\n                  "gte": "now-5h",\n                  "lte": "now"\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  },\n  {\n    "type": "condition",\n    "name": "mycondition",\n    "source": "ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i].doc_count > 100) { return true; } } return false;"\n  }\n]',
      resolve_actions: [],
      actions: [
        {
          checks: '[]',
          checksBlocks: [],
          type: 'webhook',
          name: 'mywebhook',
          throttle_period: {
            interval: 1,
            advInterval: '1h30m15s',
            unit: 's',
          },
          severity: [],
          request: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/111/111/111',
            body: 'Total: {{data.mysearch.hits.total.value}}',
            headers: '{\n  "Content-type": "application/json"\n}',
          },
        },
      ],
      _ui: {
        isSeverity: false,
        isResolveActions: false,
        severity: {
          value: [],
          valueString: '',
          order: 'ascending',
          thresholds: {
            info: 100,
            warning: 200,
            error: 300,
            critical: 400,
          },
        },
        watchType: 'graph',
        index: [
          {
            health: 'green',
            label: 'kibana_sample_data_flights',
            status: 'open',
          },
        ],
        timeField: 'timestamp',
        aggregationType: 'count',
        fieldName: [],
        topHitsAgg: {
          field: [
            {
              label: 'Carrier',
            },
          ],
          size: 3,
          order: 'asc',
        },
        overDocuments: 'top_hits',
        bucketValue: 1,
        bucketUnitOfTime: 'h',
        thresholdValue: 100,
        thresholdEnum: 'ABOVE',
        checksGraphResult: {},
        checksResult: '',
        checksBlocks: [
          {
            type: 'search',
            name: 'mysearch',
            target: 'mysearch',
            request: {
              indices: [{ label: 'kibana_sample_data_flights' }],
              body: stringifyPretty({
                size: 0,
                aggregations: {
                  bucketAgg: {
                    terms: {
                      field: 'Carrier',
                      size: 3,
                      order: {
                        _count: 'asc',
                      },
                    },
                  },
                },
                query: {
                  bool: {
                    filter: {
                      range: {
                        timestamp: {
                          gte: 'now-5h',
                          lte: 'now',
                        },
                      },
                    },
                  },
                },
              }),
            },
            response: '',
            id: expect.any(String),
          },
          {
            type: 'condition',
            name: 'mycondition',
            source:
              'ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i].doc_count > 100) { return true; } } return false;',
            target: '',
            lang: 'painless',
            response: '',
            id: expect.any(String),
          },
        ],
        frequency: 'interval',
        hourly: [
          {
            label: '1',
          },
        ],
        period: {
          interval: 1,
          advInterval: '1h30m15s',
          unit: 'm',
        },
        cron: '0 */1 * * * ?',
        daily: 0,
        weekly: {
          mon: false,
          tue: false,
          wed: false,
          thu: false,
          fri: false,
          sat: false,
          sun: false,
        },
        monthly: {
          type: 'day',
          day: 1,
        },
        timezone: [
          {
            label: 'Europe/Berlin',
          },
        ],
      },
      _meta: {
        last_edit: {
          user: 'admin',
          date: '2019-11-21T11:26:54.752Z',
        },
      },
      log_runtime_data: false,
      _tenant: 'admin_tenant',
    };

    expect(watchToFormik(watch)).toEqual(formik);
  });

  test('watch to formik: avg all docs', () => {
    const watch = {
      _ui: {
        aggregationType: 'avg',
        fieldName: [
          {
            label: 'AvgTicketPrice',
          },
        ],
        bucketValue: 1,
        timeField: 'timestamp',
        index: [
          {
            health: 'green',
            label: 'kibana_sample_data_flights',
            status: 'open',
          },
        ],
        thresholdValue: 500,
        watchType: 'graph',
        topHitsAgg: {
          field: [],
          size: 3,
          order: 'asc',
        },
        overDocuments: 'all documents',
        bucketUnitOfTime: 'h',
        thresholdEnum: 'ABOVE',
      },
      checks: [
        {
          type: 'search',
          name: 'mysearch',
          target: 'mysearch',
          request: {
            indices: ['kibana_sample_data_flights'],
            body: {
              size: 0,
              aggregations: {
                metricAgg: {
                  avg: {
                    field: 'AvgTicketPrice',
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
            },
          },
        },
        {
          type: 'condition',
          name: 'mycondition',
          source: 'data.mysearch.aggregations.metricAgg.value > 500',
        },
      ],
      active: true,
      _meta: {
        last_edit: {
          user: 'admin',
          date: '2019-11-21T11:33:56.235Z',
        },
      },
      trigger: {
        schedule: {
          interval: ['1m'],
        },
      },
      log_runtime_data: false,
      _tenant: 'admin_tenant',
      actions: [
        {
          type: 'webhook',
          name: 'mywebhook',
          throttle_period: '1s',
          request: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/111/111/111',
            body: 'Total: {{data.mysearch.hits.total.value}}',
            headers: {
              'Content-type': 'application/json',
            },
          },
        },
      ],
      _id: 'avg all docs',
    };

    const formik = {
      _id: 'avg all docs',
      active: true,
      trigger: {
        schedule: {
          interval: ['1m'],
        },
      },
      checks:
        '[\n  {\n    "type": "search",\n    "name": "mysearch",\n    "target": "mysearch",\n    "request": {\n      "indices": [\n        "kibana_sample_data_flights"\n      ],\n      "body": {\n        "size": 0,\n        "aggregations": {\n          "metricAgg": {\n            "avg": {\n              "field": "AvgTicketPrice"\n            }\n          }\n        },\n        "query": {\n          "bool": {\n            "filter": {\n              "range": {\n                "timestamp": {\n                  "gte": "now-1h",\n                  "lte": "now"\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  },\n  {\n    "type": "condition",\n    "name": "mycondition",\n    "source": "data.mysearch.aggregations.metricAgg.value > 500"\n  }\n]',
      resolve_actions: [],
      actions: [
        {
          checks: '[]',
          checksBlocks: [],
          type: 'webhook',
          name: 'mywebhook',
          throttle_period: {
            interval: 1,
            advInterval: '1h30m15s',
            unit: 's',
          },
          severity: [],
          request: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/111/111/111',
            body: 'Total: {{data.mysearch.hits.total.value}}',
            headers: '{\n  "Content-type": "application/json"\n}',
          },
        },
      ],
      _ui: {
        isSeverity: false,
        isResolveActions: false,
        severity: {
          value: [],
          valueString: '',
          order: 'ascending',
          thresholds: {
            info: 100,
            warning: 200,
            error: 300,
            critical: 400,
          },
        },
        watchType: 'graph',
        index: [
          {
            health: 'green',
            label: 'kibana_sample_data_flights',
            status: 'open',
          },
        ],
        timeField: 'timestamp',
        aggregationType: 'avg',
        fieldName: [
          {
            label: 'AvgTicketPrice',
          },
        ],
        topHitsAgg: {
          field: [],
          size: 3,
          order: 'asc',
        },
        overDocuments: 'all documents',
        bucketValue: 1,
        bucketUnitOfTime: 'h',
        thresholdValue: 500,
        thresholdEnum: 'ABOVE',
        checksGraphResult: {},
        checksResult: '',
        checksBlocks: [
          {
            type: 'search',
            name: 'mysearch',
            target: 'mysearch',
            request: {
              indices: [{ label: 'kibana_sample_data_flights' }],
              body: stringifyPretty({
                size: 0,
                aggregations: {
                  metricAgg: {
                    avg: {
                      field: 'AvgTicketPrice',
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
              }),
            },
            response: '',
            id: expect.any(String),
          },
          {
            type: 'condition',
            name: 'mycondition',
            source: 'data.mysearch.aggregations.metricAgg.value > 500',
            target: '',
            lang: 'painless',
            response: '',
            id: expect.any(String),
          },
        ],
        frequency: 'interval',
        hourly: [
          {
            label: '1',
          },
        ],
        period: {
          interval: 1,
          advInterval: '1h30m15s',
          unit: 'm',
        },
        cron: '0 */1 * * * ?',
        daily: 0,
        weekly: {
          mon: false,
          tue: false,
          wed: false,
          thu: false,
          fri: false,
          sat: false,
          sun: false,
        },
        monthly: {
          type: 'day',
          day: 1,
        },
        timezone: [
          {
            label: 'Europe/Berlin',
          },
        ],
      },
      _meta: {
        last_edit: {
          user: 'admin',
          date: '2019-11-21T11:33:56.235Z',
        },
      },
      log_runtime_data: false,
      _tenant: 'admin_tenant',
    };

    expect(watchToFormik(watch)).toEqual(formik);
  });

  test('watch to formik: avg top_hits', () => {
    const watch = {
      _ui: {
        aggregationType: 'avg',
        fieldName: [
          {
            label: 'AvgTicketPrice',
          },
        ],
        bucketValue: 1,
        timeField: 'timestamp',
        index: [
          {
            health: 'green',
            label: 'kibana_sample_data_flights',
            status: 'open',
          },
        ],
        thresholdValue: 500,
        watchType: 'graph',
        topHitsAgg: {
          field: [
            {
              label: 'Carrier',
            },
          ],
          size: 3,
          order: 'asc',
        },
        overDocuments: 'top_hits',
        bucketUnitOfTime: 'h',
        thresholdEnum: 'ABOVE',
      },
      checks: [
        {
          type: 'search',
          name: 'mysearch',
          target: 'mysearch',
          request: {
            indices: ['kibana_sample_data_flights'],
            body: {
              size: 0,
              aggregations: {
                bucketAgg: {
                  terms: {
                    field: 'Carrier',
                    size: 3,
                    order: {
                      metricAgg: 'asc',
                    },
                  },
                  aggregations: {
                    metricAgg: {
                      avg: {
                        field: 'AvgTicketPrice',
                      },
                    },
                  },
                },
              },
              query: {
                bool: {
                  filter: {
                    range: {
                      timestamp: {
                        gte: 'now-5h',
                        lte: 'now',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        {
          type: 'condition',
          name: 'mycondition',
          source:
            "ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i]['metricAgg'].value > 500) { return true; } } return false;",
        },
      ],
      active: true,
      _meta: {
        last_edit: {
          user: 'admin',
          date: '2019-11-21T11:36:17.486Z',
        },
      },
      trigger: {
        schedule: {
          interval: ['1m'],
        },
      },
      log_runtime_data: false,
      _tenant: 'admin_tenant',
      actions: [
        {
          type: 'webhook',
          name: 'mywebhook',
          throttle_period: '1s',
          request: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/111/111/111',
            body: 'Total: {{data.mysearch.hits.total.value}}',
            headers: {
              'Content-type': 'application/json',
            },
          },
        },
      ],
      _id: 'avg top_hits',
    };

    const formik = {
      _id: 'avg top_hits',
      active: true,
      trigger: {
        schedule: {
          interval: ['1m'],
        },
      },
      checks:
        '[\n  {\n    "type": "search",\n    "name": "mysearch",\n    "target": "mysearch",\n    "request": {\n      "indices": [\n        "kibana_sample_data_flights"\n      ],\n      "body": {\n        "size": 0,\n        "aggregations": {\n          "bucketAgg": {\n            "terms": {\n              "field": "Carrier",\n              "size": 3,\n              "order": {\n                "metricAgg": "asc"\n              }\n            },\n            "aggregations": {\n              "metricAgg": {\n                "avg": {\n                  "field": "AvgTicketPrice"\n                }\n              }\n            }\n          }\n        },\n        "query": {\n          "bool": {\n            "filter": {\n              "range": {\n                "timestamp": {\n                  "gte": "now-5h",\n                  "lte": "now"\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  },\n  {\n    "type": "condition",\n    "name": "mycondition",\n    "source": "ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i][\'metricAgg\'].value > 500) { return true; } } return false;"\n  }\n]',
      resolve_actions: [],
      actions: [
        {
          checks: '[]',
          checksBlocks: [],
          type: 'webhook',
          name: 'mywebhook',
          throttle_period: {
            interval: 1,
            advInterval: '1h30m15s',
            unit: 's',
          },
          severity: [],
          request: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/111/111/111',
            body: 'Total: {{data.mysearch.hits.total.value}}',
            headers: '{\n  "Content-type": "application/json"\n}',
          },
        },
      ],
      _ui: {
        isSeverity: false,
        isResolveActions: false,
        severity: {
          value: [],
          valueString: '',
          order: 'ascending',
          thresholds: {
            info: 100,
            warning: 200,
            error: 300,
            critical: 400,
          },
        },
        watchType: 'graph',
        index: [
          {
            health: 'green',
            label: 'kibana_sample_data_flights',
            status: 'open',
          },
        ],
        timeField: 'timestamp',
        aggregationType: 'avg',
        fieldName: [
          {
            label: 'AvgTicketPrice',
          },
        ],
        topHitsAgg: {
          field: [
            {
              label: 'Carrier',
            },
          ],
          size: 3,
          order: 'asc',
        },
        overDocuments: 'top_hits',
        bucketValue: 1,
        bucketUnitOfTime: 'h',
        thresholdValue: 500,
        thresholdEnum: 'ABOVE',
        checksGraphResult: {},
        checksResult: '',
        checksBlocks: [
          {
            type: 'search',
            name: 'mysearch',
            target: 'mysearch',
            request: {
              indices: [{ label: 'kibana_sample_data_flights' }],
              body: stringifyPretty({
                size: 0,
                aggregations: {
                  bucketAgg: {
                    terms: {
                      field: 'Carrier',
                      size: 3,
                      order: {
                        metricAgg: 'asc',
                      },
                    },
                    aggregations: {
                      metricAgg: {
                        avg: {
                          field: 'AvgTicketPrice',
                        },
                      },
                    },
                  },
                },
                query: {
                  bool: {
                    filter: {
                      range: {
                        timestamp: {
                          gte: 'now-5h',
                          lte: 'now',
                        },
                      },
                    },
                  },
                },
              }),
            },
            response: '',
            id: expect.any(String),
          },
          {
            type: 'condition',
            name: 'mycondition',
            source:
              "ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i]['metricAgg'].value > 500) { return true; } } return false;",
            target: '',
            lang: 'painless',
            response: '',
            id: expect.any(String),
          },
        ],
        frequency: 'interval',
        hourly: [
          {
            label: '1',
          },
        ],
        period: {
          interval: 1,
          advInterval: '1h30m15s',
          unit: 'm',
        },
        cron: '0 */1 * * * ?',
        daily: 0,
        weekly: {
          mon: false,
          tue: false,
          wed: false,
          thu: false,
          fri: false,
          sat: false,
          sun: false,
        },
        monthly: {
          type: 'day',
          day: 1,
        },
        timezone: [
          {
            label: 'Europe/Berlin',
          },
        ],
      },
      _meta: {
        last_edit: {
          user: 'admin',
          date: '2019-11-21T11:36:17.486Z',
        },
      },
      log_runtime_data: false,
      _tenant: 'admin_tenant',
    };

    expect(watchToFormik(watch)).toEqual(formik);
  });

  test('watch to formik: sum all docs', () => {
    const watch = {
      _ui: {
        aggregationType: 'sum',
        fieldName: [
          {
            label: 'AvgTicketPrice',
          },
        ],
        bucketValue: 1,
        timeField: 'timestamp',
        index: [
          {
            health: 'green',
            label: 'kibana_sample_data_flights',
            status: 'open',
          },
        ],
        thresholdValue: 500,
        watchType: 'graph',
        topHitsAgg: {
          field: [],
          size: 3,
          order: 'asc',
        },
        overDocuments: 'all documents',
        bucketUnitOfTime: 'h',
        thresholdEnum: 'ABOVE',
      },
      checks: [
        {
          type: 'search',
          name: 'mysearch',
          target: 'mysearch',
          request: {
            indices: ['kibana_sample_data_flights'],
            body: {
              size: 0,
              aggregations: {
                metricAgg: {
                  sum: {
                    field: 'AvgTicketPrice',
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
            },
          },
        },
        {
          type: 'condition',
          name: 'mycondition',
          source: 'data.mysearch.aggregations.metricAgg.value > 500',
        },
      ],
      active: true,
      _meta: {
        last_edit: {
          user: 'admin',
          date: '2019-11-21T11:37:37.750Z',
        },
      },
      trigger: {
        schedule: {
          interval: ['1m'],
        },
      },
      log_runtime_data: false,
      _tenant: 'admin_tenant',
      actions: [
        {
          type: 'webhook',
          name: 'mywebhook',
          throttle_period: '1s',
          request: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/111/111/111',
            body: 'Total: {{data.mysearch.hits.total.value}}',
            headers: {
              'Content-type': 'application/json',
            },
          },
        },
      ],
      _id: 'sum all docs',
    };

    const formik = {
      _id: 'sum all docs',
      active: true,
      trigger: {
        schedule: {
          interval: ['1m'],
        },
      },
      checks:
        '[\n  {\n    "type": "search",\n    "name": "mysearch",\n    "target": "mysearch",\n    "request": {\n      "indices": [\n        "kibana_sample_data_flights"\n      ],\n      "body": {\n        "size": 0,\n        "aggregations": {\n          "metricAgg": {\n            "sum": {\n              "field": "AvgTicketPrice"\n            }\n          }\n        },\n        "query": {\n          "bool": {\n            "filter": {\n              "range": {\n                "timestamp": {\n                  "gte": "now-1h",\n                  "lte": "now"\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  },\n  {\n    "type": "condition",\n    "name": "mycondition",\n    "source": "data.mysearch.aggregations.metricAgg.value > 500"\n  }\n]',
      resolve_actions: [],
      actions: [
        {
          checks: '[]',
          checksBlocks: [],
          type: 'webhook',
          name: 'mywebhook',
          throttle_period: {
            interval: 1,
            advInterval: '1h30m15s',
            unit: 's',
          },
          severity: [],
          request: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/111/111/111',
            body: 'Total: {{data.mysearch.hits.total.value}}',
            headers: '{\n  "Content-type": "application/json"\n}',
          },
        },
      ],
      _ui: {
        isSeverity: false,
        isResolveActions: false,
        severity: {
          value: [],
          valueString: '',
          order: 'ascending',
          thresholds: {
            info: 100,
            warning: 200,
            error: 300,
            critical: 400,
          },
        },
        watchType: 'graph',
        index: [
          {
            health: 'green',
            label: 'kibana_sample_data_flights',
            status: 'open',
          },
        ],
        timeField: 'timestamp',
        aggregationType: 'sum',
        fieldName: [
          {
            label: 'AvgTicketPrice',
          },
        ],
        topHitsAgg: {
          field: [],
          size: 3,
          order: 'asc',
        },
        overDocuments: 'all documents',
        bucketValue: 1,
        bucketUnitOfTime: 'h',
        thresholdValue: 500,
        thresholdEnum: 'ABOVE',
        checksGraphResult: {},
        checksResult: '',
        checksBlocks: [
          {
            type: 'search',
            name: 'mysearch',
            target: 'mysearch',
            request: {
              indices: [{ label: 'kibana_sample_data_flights' }],
              body: stringifyPretty({
                size: 0,
                aggregations: {
                  metricAgg: {
                    sum: {
                      field: 'AvgTicketPrice',
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
              }),
            },
            response: '',
            id: expect.any(String),
          },
          {
            type: 'condition',
            name: 'mycondition',
            source: 'data.mysearch.aggregations.metricAgg.value > 500',
            target: '',
            lang: 'painless',
            response: '',
            id: expect.any(String),
          },
        ],
        frequency: 'interval',
        hourly: [
          {
            label: '1',
          },
        ],
        period: {
          interval: 1,
          advInterval: '1h30m15s',
          unit: 'm',
        },
        cron: '0 */1 * * * ?',
        daily: 0,
        weekly: {
          mon: false,
          tue: false,
          wed: false,
          thu: false,
          fri: false,
          sat: false,
          sun: false,
        },
        monthly: {
          type: 'day',
          day: 1,
        },
        timezone: [
          {
            label: 'Europe/Berlin',
          },
        ],
      },
      _meta: {
        last_edit: {
          user: 'admin',
          date: '2019-11-21T11:37:37.750Z',
        },
      },
      log_runtime_data: false,
      _tenant: 'admin_tenant',
    };

    expect(watchToFormik(watch)).toEqual(formik);
  });

  test('watch to formik: sum top_hits', () => {
    const watch = {
      _ui: {
        aggregationType: 'sum',
        fieldName: [
          {
            label: 'AvgTicketPrice',
          },
        ],
        bucketValue: 1,
        timeField: 'timestamp',
        index: [
          {
            health: 'green',
            label: 'kibana_sample_data_flights',
            status: 'open',
          },
        ],
        thresholdValue: 500,
        watchType: 'graph',
        topHitsAgg: {
          field: [
            {
              label: 'Carrier',
            },
          ],
          size: 3,
          order: 'asc',
        },
        overDocuments: 'top_hits',
        bucketUnitOfTime: 'h',
        thresholdEnum: 'ABOVE',
      },
      checks: [
        {
          type: 'search',
          name: 'mysearch',
          target: 'mysearch',
          request: {
            indices: ['kibana_sample_data_flights'],
            body: {
              size: 0,
              aggregations: {
                bucketAgg: {
                  terms: {
                    field: 'Carrier',
                    size: 3,
                    order: {
                      metricAgg: 'asc',
                    },
                  },
                  aggregations: {
                    metricAgg: {
                      sum: {
                        field: 'AvgTicketPrice',
                      },
                    },
                  },
                },
              },
              query: {
                bool: {
                  filter: {
                    range: {
                      timestamp: {
                        gte: 'now-5h',
                        lte: 'now',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        {
          type: 'condition',
          name: 'mycondition',
          source:
            "ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i]['metricAgg'].value > 500) { return true; } } return false;",
        },
      ],
      active: true,
      _meta: {
        last_edit: {
          user: 'admin',
          date: '2019-11-21T11:38:20.451Z',
        },
      },
      trigger: {
        schedule: {
          interval: ['1m'],
        },
      },
      log_runtime_data: false,
      _tenant: 'admin_tenant',
      actions: [
        {
          type: 'webhook',
          name: 'mywebhook',
          throttle_period: '1s',
          request: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/111/111/111',
            body: 'Total: {{data.mysearch.hits.total.value}}',
            headers: {
              'Content-type': 'application/json',
            },
          },
        },
      ],
      _id: 'sum top_hits',
    };

    const formik = {
      _id: 'sum top_hits',
      active: true,
      trigger: {
        schedule: {
          interval: ['1m'],
        },
      },
      checks:
        '[\n  {\n    "type": "search",\n    "name": "mysearch",\n    "target": "mysearch",\n    "request": {\n      "indices": [\n        "kibana_sample_data_flights"\n      ],\n      "body": {\n        "size": 0,\n        "aggregations": {\n          "bucketAgg": {\n            "terms": {\n              "field": "Carrier",\n              "size": 3,\n              "order": {\n                "metricAgg": "asc"\n              }\n            },\n            "aggregations": {\n              "metricAgg": {\n                "sum": {\n                  "field": "AvgTicketPrice"\n                }\n              }\n            }\n          }\n        },\n        "query": {\n          "bool": {\n            "filter": {\n              "range": {\n                "timestamp": {\n                  "gte": "now-5h",\n                  "lte": "now"\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  },\n  {\n    "type": "condition",\n    "name": "mycondition",\n    "source": "ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i][\'metricAgg\'].value > 500) { return true; } } return false;"\n  }\n]',
      resolve_actions: [],
      actions: [
        {
          checks: '[]',
          checksBlocks: [],
          type: 'webhook',
          name: 'mywebhook',
          throttle_period: {
            interval: 1,
            advInterval: '1h30m15s',
            unit: 's',
          },
          severity: [],
          request: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/111/111/111',
            body: 'Total: {{data.mysearch.hits.total.value}}',
            headers: '{\n  "Content-type": "application/json"\n}',
          },
        },
      ],
      _ui: {
        isSeverity: false,
        isResolveActions: false,
        severity: {
          value: [],
          valueString: '',
          order: 'ascending',
          thresholds: {
            info: 100,
            warning: 200,
            error: 300,
            critical: 400,
          },
        },
        watchType: 'graph',
        index: [
          {
            health: 'green',
            label: 'kibana_sample_data_flights',
            status: 'open',
          },
        ],
        timeField: 'timestamp',
        aggregationType: 'sum',
        fieldName: [
          {
            label: 'AvgTicketPrice',
          },
        ],
        topHitsAgg: {
          field: [
            {
              label: 'Carrier',
            },
          ],
          size: 3,
          order: 'asc',
        },
        overDocuments: 'top_hits',
        bucketValue: 1,
        bucketUnitOfTime: 'h',
        thresholdValue: 500,
        thresholdEnum: 'ABOVE',
        checksGraphResult: {},
        checksResult: '',
        checksBlocks: [
          {
            type: 'search',
            name: 'mysearch',
            target: 'mysearch',
            request: {
              indices: [{ label: 'kibana_sample_data_flights' }],
              body: stringifyPretty({
                size: 0,
                aggregations: {
                  bucketAgg: {
                    terms: {
                      field: 'Carrier',
                      size: 3,
                      order: {
                        metricAgg: 'asc',
                      },
                    },
                    aggregations: {
                      metricAgg: {
                        sum: {
                          field: 'AvgTicketPrice',
                        },
                      },
                    },
                  },
                },
                query: {
                  bool: {
                    filter: {
                      range: {
                        timestamp: {
                          gte: 'now-5h',
                          lte: 'now',
                        },
                      },
                    },
                  },
                },
              }),
            },
            response: '',
            id: expect.any(String),
          },
          {
            type: 'condition',
            name: 'mycondition',
            source:
              "ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i]['metricAgg'].value > 500) { return true; } } return false;",
            target: '',
            lang: 'painless',
            response: '',
            id: expect.any(String),
          },
        ],
        frequency: 'interval',
        hourly: [
          {
            label: '1',
          },
        ],
        period: {
          interval: 1,
          advInterval: '1h30m15s',
          unit: 'm',
        },
        cron: '0 */1 * * * ?',
        daily: 0,
        weekly: {
          mon: false,
          tue: false,
          wed: false,
          thu: false,
          fri: false,
          sat: false,
          sun: false,
        },
        monthly: {
          type: 'day',
          day: 1,
        },
        timezone: [
          {
            label: 'Europe/Berlin',
          },
        ],
      },
      _meta: {
        last_edit: {
          user: 'admin',
          date: '2019-11-21T11:38:20.451Z',
        },
      },
      log_runtime_data: false,
      _tenant: 'admin_tenant',
    };

    expect(watchToFormik(watch)).toEqual(formik);
  });

  test('watch to formik: min all docs', () => {
    const watch = {
      _ui: {
        aggregationType: 'min',
        fieldName: [
          {
            label: 'AvgTicketPrice',
          },
        ],
        bucketValue: 1,
        timeField: 'timestamp',
        index: [
          {
            health: 'green',
            label: 'kibana_sample_data_flights',
            status: 'open',
          },
        ],
        thresholdValue: 500,
        watchType: 'graph',
        topHitsAgg: {
          field: [],
          size: 3,
          order: 'asc',
        },
        overDocuments: 'all documents',
        bucketUnitOfTime: 'h',
        thresholdEnum: 'ABOVE',
      },
      checks: [
        {
          type: 'search',
          name: 'mysearch',
          target: 'mysearch',
          request: {
            indices: ['kibana_sample_data_flights'],
            body: {
              size: 0,
              aggregations: {
                metricAgg: {
                  min: {
                    field: 'AvgTicketPrice',
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
            },
          },
        },
        {
          type: 'condition',
          name: 'mycondition',
          source: 'data.mysearch.aggregations.metricAgg.value > 500',
        },
      ],
      active: true,
      _meta: {
        last_edit: {
          user: 'admin',
          date: '2019-11-21T11:40:49.279Z',
        },
      },
      trigger: {
        schedule: {
          interval: ['1m'],
        },
      },
      log_runtime_data: false,
      _tenant: 'admin_tenant',
      actions: [
        {
          type: 'webhook',
          name: 'mywebhook',
          throttle_period: '1s',
          request: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/111/111/111',
            body: 'Total: {{data.mysearch.hits.total.value}}',
            headers: {
              'Content-type': 'application/json',
            },
          },
        },
      ],
      _id: 'min all docs',
    };

    const formik = {
      _id: 'min all docs',
      active: true,
      trigger: {
        schedule: {
          interval: ['1m'],
        },
      },
      checks:
        '[\n  {\n    "type": "search",\n    "name": "mysearch",\n    "target": "mysearch",\n    "request": {\n      "indices": [\n        "kibana_sample_data_flights"\n      ],\n      "body": {\n        "size": 0,\n        "aggregations": {\n          "metricAgg": {\n            "min": {\n              "field": "AvgTicketPrice"\n            }\n          }\n        },\n        "query": {\n          "bool": {\n            "filter": {\n              "range": {\n                "timestamp": {\n                  "gte": "now-1h",\n                  "lte": "now"\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  },\n  {\n    "type": "condition",\n    "name": "mycondition",\n    "source": "data.mysearch.aggregations.metricAgg.value > 500"\n  }\n]',
      resolve_actions: [],
      actions: [
        {
          checks: '[]',
          checksBlocks: [],
          type: 'webhook',
          name: 'mywebhook',
          throttle_period: {
            interval: 1,
            advInterval: '1h30m15s',
            unit: 's',
          },
          severity: [],
          request: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/111/111/111',
            body: 'Total: {{data.mysearch.hits.total.value}}',
            headers: '{\n  "Content-type": "application/json"\n}',
          },
        },
      ],
      _ui: {
        isSeverity: false,
        isResolveActions: false,
        severity: {
          value: [],
          valueString: '',
          order: 'ascending',
          thresholds: {
            info: 100,
            warning: 200,
            error: 300,
            critical: 400,
          },
        },
        watchType: 'graph',
        index: [
          {
            health: 'green',
            label: 'kibana_sample_data_flights',
            status: 'open',
          },
        ],
        timeField: 'timestamp',
        aggregationType: 'min',
        fieldName: [
          {
            label: 'AvgTicketPrice',
          },
        ],
        topHitsAgg: {
          field: [],
          size: 3,
          order: 'asc',
        },
        overDocuments: 'all documents',
        bucketValue: 1,
        bucketUnitOfTime: 'h',
        thresholdValue: 500,
        thresholdEnum: 'ABOVE',
        checksGraphResult: {},
        checksResult: '',
        checksBlocks: [
          {
            type: 'search',
            name: 'mysearch',
            target: 'mysearch',
            request: {
              indices: [{ label: 'kibana_sample_data_flights' }],
              body: stringifyPretty({
                size: 0,
                aggregations: {
                  metricAgg: {
                    min: {
                      field: 'AvgTicketPrice',
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
              }),
            },
            response: '',
            id: expect.any(String),
          },
          {
            type: 'condition',
            name: 'mycondition',
            source: 'data.mysearch.aggregations.metricAgg.value > 500',
            target: '',
            lang: 'painless',
            response: '',
            id: expect.any(String),
          },
        ],
        frequency: 'interval',
        hourly: [
          {
            label: '1',
          },
        ],
        period: {
          interval: 1,
          advInterval: '1h30m15s',
          unit: 'm',
        },
        cron: '0 */1 * * * ?',
        daily: 0,
        weekly: {
          mon: false,
          tue: false,
          wed: false,
          thu: false,
          fri: false,
          sat: false,
          sun: false,
        },
        monthly: {
          type: 'day',
          day: 1,
        },
        timezone: [
          {
            label: 'Europe/Berlin',
          },
        ],
      },
      _meta: {
        last_edit: {
          user: 'admin',
          date: '2019-11-21T11:40:49.279Z',
        },
      },
      log_runtime_data: false,
      _tenant: 'admin_tenant',
    };

    expect(watchToFormik(watch)).toEqual(formik);
  });

  test('watch to formik: min top_hits', () => {
    const watch = {
      _ui: {
        aggregationType: 'min',
        fieldName: [
          {
            label: 'AvgTicketPrice',
          },
        ],
        bucketValue: 1,
        timeField: 'timestamp',
        index: [
          {
            health: 'green',
            label: 'kibana_sample_data_flights',
            status: 'open',
          },
        ],
        thresholdValue: 500,
        watchType: 'graph',
        topHitsAgg: {
          field: [
            {
              label: 'Carrier',
            },
          ],
          size: 3,
          order: 'asc',
        },
        overDocuments: 'top_hits',
        bucketUnitOfTime: 'h',
        thresholdEnum: 'ABOVE',
      },
      checks: [
        {
          type: 'search',
          name: 'mysearch',
          target: 'mysearch',
          request: {
            indices: ['kibana_sample_data_flights'],
            body: {
              size: 0,
              aggregations: {
                bucketAgg: {
                  terms: {
                    field: 'Carrier',
                    size: 3,
                    order: {
                      metricAgg: 'asc',
                    },
                  },
                  aggregations: {
                    metricAgg: {
                      min: {
                        field: 'AvgTicketPrice',
                      },
                    },
                  },
                },
              },
              query: {
                bool: {
                  filter: {
                    range: {
                      timestamp: {
                        gte: 'now-5h',
                        lte: 'now',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        {
          type: 'condition',
          name: 'mycondition',
          source:
            "ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i]['metricAgg'].value > 500) { return true; } } return false;",
        },
      ],
      active: true,
      _meta: {
        last_edit: {
          user: 'admin',
          date: '2019-11-21T11:42:06.043Z',
        },
      },
      trigger: {
        schedule: {
          interval: ['1m'],
        },
      },
      log_runtime_data: false,
      _tenant: 'admin_tenant',
      actions: [
        {
          type: 'webhook',
          name: 'mywebhook',
          throttle_period: '1s',
          request: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/111/111/111',
            body: 'Total: {{data.mysearch.hits.total.value}}',
            headers: {
              'Content-type': 'application/json',
            },
          },
        },
      ],
      _id: 'min top_hits',
    };

    const formik = {
      _id: 'min top_hits',
      active: true,
      trigger: {
        schedule: {
          interval: ['1m'],
        },
      },
      checks:
        '[\n  {\n    "type": "search",\n    "name": "mysearch",\n    "target": "mysearch",\n    "request": {\n      "indices": [\n        "kibana_sample_data_flights"\n      ],\n      "body": {\n        "size": 0,\n        "aggregations": {\n          "bucketAgg": {\n            "terms": {\n              "field": "Carrier",\n              "size": 3,\n              "order": {\n                "metricAgg": "asc"\n              }\n            },\n            "aggregations": {\n              "metricAgg": {\n                "min": {\n                  "field": "AvgTicketPrice"\n                }\n              }\n            }\n          }\n        },\n        "query": {\n          "bool": {\n            "filter": {\n              "range": {\n                "timestamp": {\n                  "gte": "now-5h",\n                  "lte": "now"\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  },\n  {\n    "type": "condition",\n    "name": "mycondition",\n    "source": "ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i][\'metricAgg\'].value > 500) { return true; } } return false;"\n  }\n]',
      resolve_actions: [],
      actions: [
        {
          checks: '[]',
          checksBlocks: [],
          type: 'webhook',
          name: 'mywebhook',
          throttle_period: {
            interval: 1,
            advInterval: '1h30m15s',
            unit: 's',
          },
          severity: [],
          request: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/111/111/111',
            body: 'Total: {{data.mysearch.hits.total.value}}',
            headers: '{\n  "Content-type": "application/json"\n}',
          },
        },
      ],
      _ui: {
        isSeverity: false,
        isResolveActions: false,
        severity: {
          value: [],
          valueString: '',
          order: 'ascending',
          thresholds: {
            info: 100,
            warning: 200,
            error: 300,
            critical: 400,
          },
        },
        watchType: 'graph',
        index: [
          {
            health: 'green',
            label: 'kibana_sample_data_flights',
            status: 'open',
          },
        ],
        timeField: 'timestamp',
        aggregationType: 'min',
        fieldName: [
          {
            label: 'AvgTicketPrice',
          },
        ],
        topHitsAgg: {
          field: [
            {
              label: 'Carrier',
            },
          ],
          size: 3,
          order: 'asc',
        },
        overDocuments: 'top_hits',
        bucketValue: 1,
        bucketUnitOfTime: 'h',
        thresholdValue: 500,
        thresholdEnum: 'ABOVE',
        checksGraphResult: {},
        checksResult: '',
        checksBlocks: [
          {
            type: 'search',
            name: 'mysearch',
            target: 'mysearch',
            request: {
              indices: [{ label: 'kibana_sample_data_flights' }],
              body: stringifyPretty({
                size: 0,
                aggregations: {
                  bucketAgg: {
                    terms: {
                      field: 'Carrier',
                      size: 3,
                      order: {
                        metricAgg: 'asc',
                      },
                    },
                    aggregations: {
                      metricAgg: {
                        min: {
                          field: 'AvgTicketPrice',
                        },
                      },
                    },
                  },
                },
                query: {
                  bool: {
                    filter: {
                      range: {
                        timestamp: {
                          gte: 'now-5h',
                          lte: 'now',
                        },
                      },
                    },
                  },
                },
              }),
            },
            response: '',
            id: expect.any(String),
          },
          {
            type: 'condition',
            name: 'mycondition',
            source:
              "ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i]['metricAgg'].value > 500) { return true; } } return false;",
            target: '',
            lang: 'painless',
            response: '',
            id: expect.any(String),
          },
        ],
        frequency: 'interval',
        hourly: [
          {
            label: '1',
          },
        ],
        period: {
          interval: 1,
          advInterval: '1h30m15s',
          unit: 'm',
        },
        cron: '0 */1 * * * ?',
        daily: 0,
        weekly: {
          mon: false,
          tue: false,
          wed: false,
          thu: false,
          fri: false,
          sat: false,
          sun: false,
        },
        monthly: {
          type: 'day',
          day: 1,
        },
        timezone: [
          {
            label: 'Europe/Berlin',
          },
        ],
      },
      _meta: {
        last_edit: {
          user: 'admin',
          date: '2019-11-21T11:42:06.043Z',
        },
      },
      log_runtime_data: false,
      _tenant: 'admin_tenant',
    };

    expect(watchToFormik(watch)).toEqual(formik);
  });

  test('watch to formik: max all docs', () => {
    const watch = {
      _ui: {
        aggregationType: 'max',
        fieldName: [
          {
            label: 'AvgTicketPrice',
          },
        ],
        bucketValue: 1,
        timeField: 'timestamp',
        index: [
          {
            health: 'green',
            label: 'kibana_sample_data_flights',
            status: 'open',
          },
        ],
        thresholdValue: 500,
        watchType: 'graph',
        topHitsAgg: {
          field: [],
          size: 3,
          order: 'asc',
        },
        overDocuments: 'all documents',
        bucketUnitOfTime: 'h',
        thresholdEnum: 'ABOVE',
      },
      checks: [
        {
          type: 'search',
          name: 'mysearch',
          target: 'mysearch',
          request: {
            indices: ['kibana_sample_data_flights'],
            body: {
              size: 0,
              aggregations: {
                metricAgg: {
                  max: {
                    field: 'AvgTicketPrice',
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
            },
          },
        },
        {
          type: 'condition',
          name: 'mycondition',
          source: 'data.mysearch.aggregations.metricAgg.value > 500',
        },
      ],
      active: true,
      _meta: {
        last_edit: {
          user: 'admin',
          date: '2019-11-21T11:44:17.803Z',
        },
      },
      trigger: {
        schedule: {
          interval: ['1m'],
        },
      },
      log_runtime_data: false,
      _tenant: 'admin_tenant',
      actions: [
        {
          type: 'webhook',
          name: 'mywebhook',
          throttle_period: '1s',
          request: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/111/111/111',
            body: 'Total: {{data.mysearch.hits.total.value}}',
            headers: {
              'Content-type': 'application/json',
            },
          },
        },
      ],
      _id: 'max all docs',
    };

    const formik = {
      _id: 'max all docs',
      active: true,
      trigger: {
        schedule: {
          interval: ['1m'],
        },
      },
      checks:
        '[\n  {\n    "type": "search",\n    "name": "mysearch",\n    "target": "mysearch",\n    "request": {\n      "indices": [\n        "kibana_sample_data_flights"\n      ],\n      "body": {\n        "size": 0,\n        "aggregations": {\n          "metricAgg": {\n            "max": {\n              "field": "AvgTicketPrice"\n            }\n          }\n        },\n        "query": {\n          "bool": {\n            "filter": {\n              "range": {\n                "timestamp": {\n                  "gte": "now-1h",\n                  "lte": "now"\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  },\n  {\n    "type": "condition",\n    "name": "mycondition",\n    "source": "data.mysearch.aggregations.metricAgg.value > 500"\n  }\n]',
      resolve_actions: [],
      actions: [
        {
          checks: '[]',
          checksBlocks: [],
          type: 'webhook',
          name: 'mywebhook',
          throttle_period: {
            interval: 1,
            advInterval: '1h30m15s',
            unit: 's',
          },
          severity: [],
          request: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/111/111/111',
            body: 'Total: {{data.mysearch.hits.total.value}}',
            headers: '{\n  "Content-type": "application/json"\n}',
          },
        },
      ],
      _ui: {
        isSeverity: false,
        isResolveActions: false,
        severity: {
          value: [],
          valueString: '',
          order: 'ascending',
          thresholds: {
            info: 100,
            warning: 200,
            error: 300,
            critical: 400,
          },
        },
        watchType: 'graph',
        index: [
          {
            health: 'green',
            label: 'kibana_sample_data_flights',
            status: 'open',
          },
        ],
        timeField: 'timestamp',
        aggregationType: 'max',
        fieldName: [
          {
            label: 'AvgTicketPrice',
          },
        ],
        topHitsAgg: {
          field: [],
          size: 3,
          order: 'asc',
        },
        overDocuments: 'all documents',
        bucketValue: 1,
        bucketUnitOfTime: 'h',
        thresholdValue: 500,
        thresholdEnum: 'ABOVE',
        checksGraphResult: {},
        checksResult: '',
        checksBlocks: [
          {
            type: 'search',
            name: 'mysearch',
            target: 'mysearch',
            request: {
              indices: [{ label: 'kibana_sample_data_flights' }],
              body: stringifyPretty({
                size: 0,
                aggregations: {
                  metricAgg: {
                    max: {
                      field: 'AvgTicketPrice',
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
              }),
            },
            response: '',
            id: expect.any(String),
          },
          {
            type: 'condition',
            name: 'mycondition',
            source: 'data.mysearch.aggregations.metricAgg.value > 500',
            target: '',
            lang: 'painless',
            response: '',
            id: expect.any(String),
          },
        ],
        frequency: 'interval',
        hourly: [
          {
            label: '1',
          },
        ],
        period: {
          interval: 1,
          advInterval: '1h30m15s',
          unit: 'm',
        },
        cron: '0 */1 * * * ?',
        daily: 0,
        weekly: {
          mon: false,
          tue: false,
          wed: false,
          thu: false,
          fri: false,
          sat: false,
          sun: false,
        },
        monthly: {
          type: 'day',
          day: 1,
        },
        timezone: [
          {
            label: 'Europe/Berlin',
          },
        ],
      },
      _meta: {
        last_edit: {
          user: 'admin',
          date: '2019-11-21T11:44:17.803Z',
        },
      },
      log_runtime_data: false,
      _tenant: 'admin_tenant',
    };

    expect(watchToFormik(watch)).toEqual(formik);
  });

  test('watch to formik: max top_hits', () => {
    const watch = {
      _ui: {
        aggregationType: 'max',
        fieldName: [
          {
            label: 'AvgTicketPrice',
          },
        ],
        bucketValue: 1,
        timeField: 'timestamp',
        index: [
          {
            health: 'green',
            label: 'kibana_sample_data_flights',
            status: 'open',
          },
        ],
        thresholdValue: 500,
        watchType: 'graph',
        topHitsAgg: {
          field: [
            {
              label: 'Carrier',
            },
          ],
          size: 3,
          order: 'asc',
        },
        overDocuments: 'top_hits',
        bucketUnitOfTime: 'h',
        thresholdEnum: 'ABOVE',
      },
      checks: [
        {
          type: 'search',
          name: 'mysearch',
          target: 'mysearch',
          request: {
            indices: ['kibana_sample_data_flights'],
            body: {
              size: 0,
              aggregations: {
                bucketAgg: {
                  terms: {
                    field: 'Carrier',
                    size: 3,
                    order: {
                      metricAgg: 'asc',
                    },
                  },
                  aggregations: {
                    metricAgg: {
                      max: {
                        field: 'AvgTicketPrice',
                      },
                    },
                  },
                },
              },
              query: {
                bool: {
                  filter: {
                    range: {
                      timestamp: {
                        gte: 'now-5h',
                        lte: 'now',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        {
          type: 'condition',
          name: 'mycondition',
          source:
            "ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i]['metricAgg'].value > 500) { return true; } } return false;",
        },
      ],
      active: true,
      _meta: {
        last_edit: {
          user: 'admin',
          date: '2019-11-21T11:45:12.007Z',
        },
      },
      trigger: {
        schedule: {
          interval: ['1m'],
        },
      },
      log_runtime_data: false,
      _tenant: 'admin_tenant',
      actions: [
        {
          type: 'webhook',
          name: 'mywebhook',
          throttle_period: '1s',
          request: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/111/111/111',
            body: 'Total: {{data.mysearch.hits.total.value}}',
            headers: {
              'Content-type': 'application/json',
            },
          },
        },
      ],
      _id: 'max top_hits',
    };

    const formik = {
      _id: 'max top_hits',
      active: true,
      trigger: {
        schedule: {
          interval: ['1m'],
        },
      },
      checks:
        '[\n  {\n    "type": "search",\n    "name": "mysearch",\n    "target": "mysearch",\n    "request": {\n      "indices": [\n        "kibana_sample_data_flights"\n      ],\n      "body": {\n        "size": 0,\n        "aggregations": {\n          "bucketAgg": {\n            "terms": {\n              "field": "Carrier",\n              "size": 3,\n              "order": {\n                "metricAgg": "asc"\n              }\n            },\n            "aggregations": {\n              "metricAgg": {\n                "max": {\n                  "field": "AvgTicketPrice"\n                }\n              }\n            }\n          }\n        },\n        "query": {\n          "bool": {\n            "filter": {\n              "range": {\n                "timestamp": {\n                  "gte": "now-5h",\n                  "lte": "now"\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  },\n  {\n    "type": "condition",\n    "name": "mycondition",\n    "source": "ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i][\'metricAgg\'].value > 500) { return true; } } return false;"\n  }\n]',
      resolve_actions: [],
      actions: [
        {
          checks: '[]',
          checksBlocks: [],
          type: 'webhook',
          name: 'mywebhook',
          throttle_period: {
            interval: 1,
            advInterval: '1h30m15s',
            unit: 's',
          },
          severity: [],
          request: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/111/111/111',
            body: 'Total: {{data.mysearch.hits.total.value}}',
            headers: '{\n  "Content-type": "application/json"\n}',
          },
        },
      ],
      _ui: {
        isSeverity: false,
        isResolveActions: false,
        severity: {
          value: [],
          valueString: '',
          order: 'ascending',
          thresholds: {
            info: 100,
            warning: 200,
            error: 300,
            critical: 400,
          },
        },
        watchType: 'graph',
        index: [
          {
            health: 'green',
            label: 'kibana_sample_data_flights',
            status: 'open',
          },
        ],
        timeField: 'timestamp',
        aggregationType: 'max',
        fieldName: [
          {
            label: 'AvgTicketPrice',
          },
        ],
        topHitsAgg: {
          field: [
            {
              label: 'Carrier',
            },
          ],
          size: 3,
          order: 'asc',
        },
        overDocuments: 'top_hits',
        bucketValue: 1,
        bucketUnitOfTime: 'h',
        thresholdValue: 500,
        thresholdEnum: 'ABOVE',
        checksGraphResult: {},
        checksResult: '',
        checksBlocks: [
          {
            type: 'search',
            name: 'mysearch',
            target: 'mysearch',
            request: {
              indices: [{ label: 'kibana_sample_data_flights' }],
              body: stringifyPretty({
                size: 0,
                aggregations: {
                  bucketAgg: {
                    terms: {
                      field: 'Carrier',
                      size: 3,
                      order: {
                        metricAgg: 'asc',
                      },
                    },
                    aggregations: {
                      metricAgg: {
                        max: {
                          field: 'AvgTicketPrice',
                        },
                      },
                    },
                  },
                },
                query: {
                  bool: {
                    filter: {
                      range: {
                        timestamp: {
                          gte: 'now-5h',
                          lte: 'now',
                        },
                      },
                    },
                  },
                },
              }),
            },
            response: '',
            id: expect.any(String),
          },
          {
            type: 'condition',
            name: 'mycondition',
            source:
              "ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i]['metricAgg'].value > 500) { return true; } } return false;",
            target: '',
            lang: 'painless',
            response: '',
            id: expect.any(String),
          },
        ],
        frequency: 'interval',
        hourly: [
          {
            label: '1',
          },
        ],
        period: {
          interval: 1,
          advInterval: '1h30m15s',
          unit: 'm',
        },
        cron: '0 */1 * * * ?',
        daily: 0,
        weekly: {
          mon: false,
          tue: false,
          wed: false,
          thu: false,
          fri: false,
          sat: false,
          sun: false,
        },
        monthly: {
          type: 'day',
          day: 1,
        },
        timezone: [
          {
            label: 'Europe/Berlin',
          },
        ],
      },
      _meta: {
        last_edit: {
          user: 'admin',
          date: '2019-11-21T11:45:12.007Z',
        },
      },
      log_runtime_data: false,
      _tenant: 'admin_tenant',
    };

    expect(watchToFormik(watch)).toEqual(formik);
  });

  test('watch to formik: Blocks watch', () => {
    const watch = {
      _ui: {
        aggregationType: 'count',
        fieldName: [],
        bucketValue: 1,
        timeField: '',
        index: [],
        thresholdValue: 1000,
        watchType: 'blocks',
        topHitsAgg: {
          field: [],
          size: 3,
          order: 'asc',
        },
        overDocuments: 'all documents',
        bucketUnitOfTime: 'h',
        thresholdEnum: 'ABOVE',
      },
      checks: [
        {
          type: 'search',
          name: 'testsearch',
          target: 'testsearch',
          request: {
            indices: ['kibana_sample_data_ecommerce'],
            body: {
              from: 0,
              size: 10,
              query: {
                range: {
                  taxful_total_price: {
                    gte: 100,
                  },
                },
              },
            },
          },
        },
        {
          type: 'condition',
          name: 'testcondition',
          source: 'ctx.testsearch.hits.hits.length > 0',
        },
      ],
      active: true,
      _meta: {
        last_edit: {
          user: 'admin',
          date: '2019-11-21T12:00:50.281Z',
        },
      },
      trigger: {
        schedule: {
          timezone: 'Europe/Rome',
          cron: ['0 0/30 * * * ?'],
        },
      },
      log_runtime_data: false,
      _tenant: 'admin_tenant',
      actions: [
        {
          type: 'index',
          name: 'my_index',
          throttle_period: '1m',
          index: 'testsink',
          checks: [
            {
              type: 'search',
              name: 'testsearch',
              target: 'testsearch',
              request: {
                indices: ['kibana_sample_data_ecommerce'],
                body: {
                  from: 0,
                  size: 10,
                  query: {
                    range: {
                      taxful_total_price: {
                        gte: 100,
                      },
                    },
                  },
                },
              },
            },
            {
              type: 'condition',
              name: 'testcondition',
              source: 'ctx.testsearch.hits.hits.length > 0',
              lang: 'painless',
            },
          ],
        },
        {
          type: 'webhook',
          name: 'my_webhook',
          throttle_period: '1m',
          request: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/111/111/111',
            body:
              '{"text": "Goods total: {{testsearch.hits.total.value}}", "attachments": [{"title": "First 10 customers", "text": "{{#testsearch.hits.hits}}{{#_source}}_{{customer_full_name}}_, {{email}}, *price: {{taxful_total_price}}*, {{/_source}}{{/testsearch.hits.hits}}"}]}',
            headers: {
              'Content-type': 'application/json',
            },
          },
        },
      ],
      _id: 'check blocks',
    };

    const formik = {
      _id: 'check blocks',
      active: true,
      trigger: {
        schedule: {
          timezone: 'Europe/Rome',
          cron: ['0 0/30 * * * ?'],
        },
      },
      checks:
        '[\n  {\n    "type": "search",\n    "name": "testsearch",\n    "target": "testsearch",\n    "request": {\n      "indices": [\n        "kibana_sample_data_ecommerce"\n      ],\n      "body": {\n        "from": 0,\n        "size": 10,\n        "query": {\n          "range": {\n            "taxful_total_price": {\n              "gte": 100\n            }\n          }\n        }\n      }\n    }\n  },\n  {\n    "type": "condition",\n    "name": "testcondition",\n    "source": "ctx.testsearch.hits.hits.length > 0"\n  }\n]',
      resolve_actions: [],
      actions: [
        {
          checks: stringifyPretty([
            {
              type: 'search',
              name: 'testsearch',
              target: 'testsearch',
              request: {
                indices: ['kibana_sample_data_ecommerce'],
                body: {
                  from: 0,
                  size: 10,
                  query: {
                    range: {
                      taxful_total_price: {
                        gte: 100,
                      },
                    },
                  },
                },
              },
            },
            {
              type: 'condition',
              name: 'testcondition',
              source: 'ctx.testsearch.hits.hits.length > 0',
              lang: 'painless',
            },
          ]),
          checksBlocks: [
            {
              type: 'search',
              name: 'testsearch',
              target: 'testsearch',
              request: {
                indices: [{ label: 'kibana_sample_data_ecommerce' }],
                body: stringifyPretty({
                  from: 0,
                  size: 10,
                  query: {
                    range: {
                      taxful_total_price: {
                        gte: 100,
                      },
                    },
                  },
                }),
              },
              response: '',
              id: expect.any(String),
            },
            {
              type: 'condition',
              name: 'testcondition',
              target: '',
              source: 'ctx.testsearch.hits.hits.length > 0',
              lang: 'painless',
              response: '',
              id: expect.any(String),
            },
          ],
          type: 'index',
          name: 'my_index',
          throttle_period: {
            interval: 1,
            advInterval: '1h30m15s',
            unit: 'm',
          },
          severity: [],
          index: [
            {
              label: 'testsink',
            },
          ],
        },
        {
          checks: '[]',
          checksBlocks: [],
          type: 'webhook',
          name: 'my_webhook',
          throttle_period: {
            interval: 1,
            advInterval: '1h30m15s',
            unit: 'm',
          },
          severity: [],
          proxy: '',
          request: {
            method: 'POST',
            url: 'https://hooks.slack.com/services/111/111/111',
            body:
              '{"text": "Goods total: {{testsearch.hits.total.value}}", "attachments": [{"title": "First 10 customers", "text": "{{#testsearch.hits.hits}}{{#_source}}_{{customer_full_name}}_, {{email}}, *price: {{taxful_total_price}}*, {{/_source}}{{/testsearch.hits.hits}}"}]}',
            headers: '{\n  "Content-type": "application/json"\n}',
          },
        },
      ],
      _ui: {
        isSeverity: false,
        isResolveActions: false,
        severity: {
          value: [],
          valueString: '',
          order: 'ascending',
          thresholds: {
            info: 100,
            warning: 200,
            error: 300,
            critical: 400,
          },
        },
        watchType: 'blocks',
        index: [],
        timeField: '',
        aggregationType: 'count',
        fieldName: [],
        topHitsAgg: {
          field: [],
          size: 3,
          order: 'asc',
        },
        overDocuments: 'all documents',
        bucketValue: 1,
        bucketUnitOfTime: 'h',
        thresholdValue: 1000,
        thresholdEnum: 'ABOVE',
        checksGraphResult: {},
        checksResult: '',
        checksBlocks: [
          {
            type: 'search',
            name: 'testsearch',
            target: 'testsearch',
            request: {
              indices: [{ label: 'kibana_sample_data_ecommerce' }],
              body: stringifyPretty({
                from: 0,
                size: 10,
                query: {
                  range: {
                    taxful_total_price: {
                      gte: 100,
                    },
                  },
                },
              }),
            },
            response: '',
            id: expect.any(String),
          },
          {
            type: 'condition',
            name: 'testcondition',
            source: 'ctx.testsearch.hits.hits.length > 0',
            target: '',
            lang: 'painless',
            response: '',
            id: expect.any(String),
          },
        ],
        frequency: 'cron',
        hourly: [
          {
            label: '1',
          },
        ],
        period: {
          interval: 1,
          advInterval: '1h30m15s',
          unit: 'm',
        },
        cron: '0 0/30 * * * ?',
        daily: 0,
        weekly: {
          mon: false,
          tue: false,
          wed: false,
          thu: false,
          fri: false,
          sat: false,
          sun: false,
        },
        monthly: {
          type: 'day',
          day: 1,
        },
        timezone: [
          {
            label: 'Europe/Rome',
          },
        ],
      },
      _meta: {
        last_edit: {
          user: 'admin',
          date: '2019-11-21T12:00:50.281Z',
        },
      },
      log_runtime_data: false,
      _tenant: 'admin_tenant',
    };

    expect(watchToFormik(watch)).toEqual(formik);
  });
});
