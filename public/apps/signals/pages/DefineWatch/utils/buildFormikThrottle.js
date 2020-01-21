import { matchExponentialThrottleInterval, buildTimePeriod } from './helpers';
import { ADVANCED_TIME_PERIOD_UNIT, SCHEDULE_DEFAULTS } from './constants';

export const buildFormikThrottle = (watch = {}) => {
  if (!watch.throttle_period) {
    return {
      ...watch,
      throttle_period: SCHEDULE_DEFAULTS.period
    };
  }

  const [advInterval] = matchExponentialThrottleInterval(watch.throttle_period) || [];

  if (advInterval) {
    return {
      ...watch,
      throttle_period: {
        interval: 1,
        advInterval,
        unit: ADVANCED_TIME_PERIOD_UNIT,
      },
    };
  }

  return {
    ...watch,
    throttle_period: buildTimePeriod(watch.throttle_period),
  };
};
