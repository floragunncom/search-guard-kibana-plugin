import { buildTimePeriod } from './buildTimePeriod';
import {
  SCHEDULE_DEFAULTS,
  ADVANCED_TIME_PERIOD_UNIT,
  TIME_PERIOD_UNITS,
} from '../constants';

describe('buildTimePeriod', () => {
  describe('can build time interval', () => {
    const intervals = Object.values(TIME_PERIOD_UNITS)
      .map(unit => ({
        input: `10${unit}`,
        output: {
          interval: 10,
          unit,
          advInterval: SCHEDULE_DEFAULTS.period.advInterval,
        },
      }))

    intervals.push({
      input: '0',
      output: {
        interval: 0,
        unit: TIME_PERIOD_UNITS.MILLISECONDS,
        advInterval: SCHEDULE_DEFAULTS.period.advInterval,
      },
    });

    test.each(intervals)('build interval', ({ input, output }) => {
      expect(buildTimePeriod(input)).toEqual(output);
    });
  });

  describe('can build advanced time interval', () => {
    const advInterval = Object.values(TIME_PERIOD_UNITS).map(unit => `1${unit}`).join('');
    const intervals = [
      {
        input: advInterval,
        output: {
          interval: SCHEDULE_DEFAULTS.period.interval,
          unit: ADVANCED_TIME_PERIOD_UNIT,
          advInterval,
        },
      },
    ];

    test.each(intervals)('build advanced interval', ({ input, output }) => {
      expect(buildTimePeriod(input)).toEqual(output);
    });
  });
});
