import { matchExponentialThrottleInterval, buildTimePeriod } from './helpers';
import { ADVANCED_TIME_PERIOD_UNIT } from './constants';

export const buildFormikThrottle = watch => {
  const [ advInterval ] = matchExponentialThrottleInterval(watch.throttle_period) || [];

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
}