import { TIME_PERIOD_UNITS } from '../constants';

const timeIntervals = Object.values(TIME_PERIOD_UNITS)
  .map(unit => `(?:\\d+${unit})?`)
  .join('');

export const matchAdvancedInterval = timeString => timeString.match(new RegExp(`^${timeIntervals}$`));