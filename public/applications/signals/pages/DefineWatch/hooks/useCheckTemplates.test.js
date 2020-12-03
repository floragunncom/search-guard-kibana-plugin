/* eslint-disable @kbn/eslint/require-license-header */
import { getFormikChecksPlusTemplate } from './useCheckTemplates';
import { stringifyPretty } from '../../../utils/helpers';
import { WATCH_TYPES } from '../utils/constants';

describe('useCheckTemplates', () => {
  describe('get formik checks for BlocksWatch', () => {
    test("add template to action's checks", () => {
      const template = {
        type: 'static',
        name: 'constants',
        target: 'constants',
        value: {
          threshold: 0,
        },
      };

      const values = {
        _ui: {
          watchType: WATCH_TYPES.BLOCKS,
        },
        actions: [
          {
            checksBlocks: [
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
                id: '123',
              },
            ],
          },
        ],
      };

      const checks = [
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
        {
          type: 'static',
          name: 'constants',
          target: 'constants',
          value: stringifyPretty({
            threshold: 0,
          }),
          response: '',
          id: expect.any(String),
        },
      ];

      expect(
        getFormikChecksPlusTemplate({
          template,
          values,
          checksPath: 'actions[0].checksBlocks',
        })
      ).toEqual(checks);
    });

    test('add template to checks', () => {
      const template = {
        type: 'static',
        name: 'constants',
        target: 'constants',
        value: {
          threshold: 0,
        },
      };

      const values = {
        _ui: {
          watchType: WATCH_TYPES.BLOCKS,
          checksBlocks: [
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
              id: '123',
            },
          ],
        },
      };

      const checks = [
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
        {
          type: 'static',
          name: 'constants',
          target: 'constants',
          value: stringifyPretty({
            threshold: 0,
          }),
          response: '',
          id: expect.any(String),
        },
      ];

      expect(
        getFormikChecksPlusTemplate({
          template,
          values,
          checksPath: '_ui.checksBlocks',
        })
      ).toEqual(checks);
    });
  });

  describe('get formik checks for JsonWatch', () => {
    test('add template to checks', () => {
      const template = {
        type: 'static',
        name: 'constants',
        target: 'constants',
        value: {
          threshold: 0,
        },
      };

      const values = {
        checks: stringifyPretty([
          {
            type: 'static',
            name: 'constants',
            target: 'constants',
            value: {
              ticket_price: 800,
              window: '1h',
            },
          },
          {
            type: 'search',
            name: 'avg_ticket_price',
            target: 'avg_ticket_price',
            request: {
              indices: ['kibana_sample_data_flights'],
              body: {
                query: {},
              },
            },
          },
          {
            type: 'condition',
            name: 'low_price',
            source:
              'data.avg_ticket_price.aggregations.metricAgg.value < data.constants.ticket_price',
          },
        ]),
        _ui: {
          watchType: WATCH_TYPES.JSON,
        },
      };

      const checks = stringifyPretty([
        {
          type: 'static',
          name: 'constants',
          target: 'constants',
          value: {
            ticket_price: 800,
            window: '1h',
          },
        },
        {
          type: 'search',
          name: 'avg_ticket_price',
          target: 'avg_ticket_price',
          request: {
            indices: ['kibana_sample_data_flights'],
            body: {
              query: {},
            },
          },
        },
        {
          type: 'condition',
          name: 'low_price',
          source:
            'data.avg_ticket_price.aggregations.metricAgg.value < data.constants.ticket_price',
        },
        {
          type: 'static',
          name: 'constants',
          target: 'constants',
          value: {
            threshold: 0,
          },
        },
      ]);

      expect(
        getFormikChecksPlusTemplate({
          template,
          values,
          checksPath: 'checks',
        })
      ).toEqual(checks);
    });

    test("add template to action's checks", () => {
      const template = {
        type: 'static',
        name: 'constants',
        target: 'constants',
        value: {
          threshold: 0,
        },
      };

      const values = {
        _ui: {
          watchType: WATCH_TYPES.JSON,
        },
        actions: [
          {
            checks: stringifyPretty([
              {
                type: 'static',
                name: 'constants',
                target: 'constants',
                value: {
                  ticket_price: 800,
                  window: '1h',
                },
              },
              {
                type: 'search',
                name: 'avg_ticket_price',
                target: 'avg_ticket_price',
                request: {
                  indices: ['kibana_sample_data_flights'],
                  body: {
                    query: {},
                  },
                },
              },
              {
                type: 'condition',
                name: 'low_price',
                source:
                  'data.avg_ticket_price.aggregations.metricAgg.value < data.constants.ticket_price',
              },
            ]),
          },
        ],
      };

      const checks = stringifyPretty([
        {
          type: 'static',
          name: 'constants',
          target: 'constants',
          value: {
            ticket_price: 800,
            window: '1h',
          },
        },
        {
          type: 'search',
          name: 'avg_ticket_price',
          target: 'avg_ticket_price',
          request: {
            indices: ['kibana_sample_data_flights'],
            body: {
              query: {},
            },
          },
        },
        {
          type: 'condition',
          name: 'low_price',
          source:
            'data.avg_ticket_price.aggregations.metricAgg.value < data.constants.ticket_price',
        },
        {
          type: 'static',
          name: 'constants',
          target: 'constants',
          value: {
            threshold: 0,
          },
        },
      ]);

      expect(
        getFormikChecksPlusTemplate({
          template,
          values,
          checksPath: 'actions[0].checks',
        })
      ).toEqual(checks);
    });
  });
});
