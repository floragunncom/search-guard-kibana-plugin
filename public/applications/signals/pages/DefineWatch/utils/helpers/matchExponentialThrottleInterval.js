import { TIME_PERIOD_UNITS } from '../constants';

const timeInterval = Object.values(TIME_PERIOD_UNITS)
  .map(unit => `(?:\\d+${unit})?`)
  .join('');

const exponent = '\\*{2}\\d+(?:\\.?\\d+)?';

const capTimeInterval = Object.values(TIME_PERIOD_UNITS)
  .map(unit => `(?:\\|?\\d+${unit})?`)
  .join('');

export const matchExponentialThrottleInterval = timeString =>
  timeString.match(new RegExp(`^${timeInterval}${exponent}${capTimeInterval}$`));