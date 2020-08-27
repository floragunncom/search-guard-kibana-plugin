import { buildThrottle } from './buildThrottle';
import { ADVANCED_TIME_PERIOD_UNIT } from './constants';

describe('buildThrottle', () => {
  test('can create throttle period', () => {
    const formik = {
      throttle_period: {
        interval: 2,
        advInterval: '2m**2|200m',
        unit: 'm',
      },
    };

    const watch = {
      throttle_period: '2m'
    };

    expect(buildThrottle(formik)).toEqual(watch);
  });

  test('can create exponential throttle period', () => {
    const formik = {
      throttle_period: {
        interval: 2,
        advInterval: '2m**2',
        unit: ADVANCED_TIME_PERIOD_UNIT,
      },
    };

    const watch = {
      throttle_period: '2m**2'
    };

    expect(buildThrottle(formik)).toEqual(watch);
  });

  test('can create exponential throttle period with cap', () => {
    const formik = {
      throttle_period: {
        interval: 2,
        advInterval: '2m**2|1d',
        unit: ADVANCED_TIME_PERIOD_UNIT,
      },
    };

    const watch = {
      throttle_period: '2m**2|1d'
    };

    expect(buildThrottle(formik)).toEqual(watch);
  });
});