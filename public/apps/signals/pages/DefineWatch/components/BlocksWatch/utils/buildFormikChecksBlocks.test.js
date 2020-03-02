import { buildFormikChecksBlocks } from './buildFormikChecksBlocks';
import { stringifyPretty } from '../../../../../utils/helpers';

describe('buildFormikChecksBlocks', () => {
  test('can create checks blocks formik', () => {
    const checks = [
      {
        type: 'static',
        name: 'constants',
        value: {
          a: 1,
        },
      },
    ];

    const formikChecks = [
      {
        type: 'static',
        name: 'constants',
        value: stringifyPretty({
          a: 1,
        }),
        id: 0,
        response: '',
        target: '',
      },
    ];

    expect(buildFormikChecksBlocks(checks)).toEqual(formikChecks);
  });

  test('can create checks blocks formik if unknown check', () => {
    const checks = [
      {
        type: 'unknown',
      },
    ];

    const formikChecks = [
      {
        type: 'static',
        value: stringifyPretty({
          error: `Unknown block type "unknown"! Please report to developers. Defaults to static type.`,
        }),
        id: 0,
        response: '',
        target: '',
        name: '',
      },
    ];

    expect(buildFormikChecksBlocks(checks)).toEqual(formikChecks);
  });
});
