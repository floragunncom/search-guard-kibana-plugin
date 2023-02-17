/** @jest-environment jsdom */
import { buildFormikThrottle } from './buildFormikThrottle';
import { SCHEDULE_DEFAULTS, ADVANCED_TIME_PERIOD_UNIT } from './constants';

describe('buildFormikThrottle', () => {
  test('can create throttle formik period if no throttle period', () => {
    const watch = {};

    const formik = {
      throttle_period: SCHEDULE_DEFAULTS.period,
    };

    expect(buildFormikThrottle(watch)).toEqual(formik);
  });

  test('can create throttle formik period from throttle period', () => {
    const watch = {
      throttle_period: '2m'
    };

    const formik = {
      throttle_period: {
        interval: 2,
        advInterval: SCHEDULE_DEFAULTS.period.advInterval,
        unit: 'm',
      },
    };

    expect(buildFormikThrottle(watch)).toEqual(formik);
  });

  test('can create exponential throttle formik period', () => {
    const watch = {
      throttle_period: '2m**2',
    };

    const formik = {
      throttle_period: {
        interval: 1,
        advInterval: '2m**2',
        unit: ADVANCED_TIME_PERIOD_UNIT,
      },
    };

    expect(buildFormikThrottle(watch)).toEqual(formik);
  });

  test('can create exponential throttle formik period with cap', () => {
    const watch = {
      throttle_period: '2m**2|24h',
    };

    const formik = {
      throttle_period: {
        interval: 1,
        advInterval: '2m**2|24h',
        unit: ADVANCED_TIME_PERIOD_UNIT,
      },
    };

    expect(buildFormikThrottle(watch)).toEqual(formik);
  });
});
