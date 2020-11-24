import { ADVANCED_TIME_PERIOD_UNIT } from './constants';

export const buildThrottle = watch => {
  const {
    throttle_period: {
      interval,
      advInterval,
      unit,
    },
    ...rest
  } = watch;

  return {
    ...rest,
    throttle_period: unit === ADVANCED_TIME_PERIOD_UNIT
      ? advInterval
      : interval + unit,
  };
};