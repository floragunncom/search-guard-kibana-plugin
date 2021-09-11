/* eslint-disable @osd/eslint/require-license-header */
import { getChecksExecutionResponse } from './helpers';
import { stringifyPretty } from '../../../../utils/helpers';

describe('getChecksExecutionResponse', () => {
  describe('get checks response', () => {
    test('runtime data', () => {
      const formikValues = {};
      const checksResponse = stringifyPretty({ runtime_attributes: { a: {} } });
      const result = stringifyPretty({ a: {} });

      expect(getChecksExecutionResponse(formikValues, checksResponse)).toEqual(result);
    });

    test('no runtime data (e.g., ES error)', () => {
      const formikValues = {};
      const checksResponse = stringifyPretty({ a: {} });
      const result = stringifyPretty({ a: {} });

      expect(getChecksExecutionResponse(formikValues, checksResponse)).toEqual(result);
    });

    test('return "{}" if fail to parse response string', () => {
      const formikValues = {};
      const checksResponse = '{ a: {}';

      expect(getChecksExecutionResponse(formikValues, checksResponse)).toEqual('{}');
    });
  });

  describe('get checks response from formik values', () => {
    test('runtime data', () => {
      const formikValues = { _ui: { checksResult: { runtime_attributes: { a: {} } } } };
      const result = stringifyPretty({ a: {} });

      expect(getChecksExecutionResponse(formikValues)).toEqual(result);
    });

    test('no runtime data (e.g., ES error)', () => {
      const formikValues = { _ui: { checksResult: { a: {} } } };
      const result = stringifyPretty({ a: {} });

      expect(getChecksExecutionResponse(formikValues)).toEqual(result);
    });
  });
});
