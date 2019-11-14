import { matchInterval } from './matchInterval';
import { matchAdvancedInterval } from './matchAdvancedInterval';
import {
  SCHEDULE_DEFAULTS,
  ADVANCED_TIME_PERIOD_UNIT,
  TIME_PERIOD_UNITS,
} from '../constants';

export const buildTimePeriod = timeString => {
  const { advInterval: DEFAULT_ADV_INTERVAL, interval: DEFAULT_INTERVAL } = SCHEDULE_DEFAULTS.period;
  let [, interval, unit] = matchInterval(timeString) || [];

  if (interval) {
    return {
      interval: +interval,
      advInterval: DEFAULT_ADV_INTERVAL,
      unit: unit || TIME_PERIOD_UNITS.MILLISECONDS,
    };
  }

  [interval] = matchAdvancedInterval(timeString) || [];

  return {
    interval: DEFAULT_INTERVAL,
    advInterval: interval || DEFAULT_ADV_INTERVAL,
    unit: ADVANCED_TIME_PERIOD_UNIT,
  };
};
