import { buildChecksFromChecksBlocks } from './buildChecksFromChecksBlocks';
import { stringifyPretty } from '../../../../../utils/helpers';

describe('buildChecksFromChecksBlocks', () => {
  test('can build checks', () => {
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

    const checks = [
      {
        type: 'static',
        name: 'constants',
        value: {
          a: 1,
        },
      },
    ];

    expect(buildChecksFromChecksBlocks(formikChecks)).toEqual(checks);
  });
});
