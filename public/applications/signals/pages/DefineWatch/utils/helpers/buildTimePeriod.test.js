/*
 *    Copyright 2020 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { buildTimePeriod } from './buildTimePeriod';
import { SCHEDULE_DEFAULTS, ADVANCED_TIME_PERIOD_UNIT, TIME_PERIOD_UNITS } from '../constants';

describe('buildTimePeriod', () => {
  describe('can build time interval', () => {
    const intervals = Object.values(TIME_PERIOD_UNITS).map((unit) => ({
      input: `10${unit}`,
      output: {
        interval: 10,
        unit,
        advInterval: SCHEDULE_DEFAULTS.period.advInterval,
      },
    }));

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
    const advInterval = Object.values(TIME_PERIOD_UNITS)
      .map((unit) => `1${unit}`)
      .join('');
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
