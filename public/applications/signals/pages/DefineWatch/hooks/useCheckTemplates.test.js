/** @jest-environment jsdom */
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
});
