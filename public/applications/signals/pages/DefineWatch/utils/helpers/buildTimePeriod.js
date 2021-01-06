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

import { matchInterval } from './matchInterval';
import { matchAdvancedInterval } from './matchAdvancedInterval';
import { SCHEDULE_DEFAULTS, ADVANCED_TIME_PERIOD_UNIT, TIME_PERIOD_UNITS } from '../constants';

export const buildTimePeriod = (timeString) => {
  const {
    advInterval: DEFAULT_ADV_INTERVAL,
    interval: DEFAULT_INTERVAL,
  } = SCHEDULE_DEFAULTS.period;
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
