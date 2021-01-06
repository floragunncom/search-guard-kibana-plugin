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

import { comboBoxOptionsToArray } from '../../../utils/helpers';
import { ADVANCED_TIME_PERIOD_UNIT } from './constants';

export default function buildSchedule({
  frequency,
  period,
  daily,
  hourly,
  weekly,
  monthly,
  cron,
  timezone,
}) {
  let schedule;

  switch (frequency) {
    case 'interval': {
      if (period.unit === ADVANCED_TIME_PERIOD_UNIT) {
        schedule = [period.advInterval];
      } else {
        schedule = [period.interval + period.unit];
      }
      break;
    }

    //TODO: add hourly test
    case 'hourly': {
      schedule = [{ minute: hourly.map((hour) => parseInt(hour.label, 10)) }];
      break;
    }

    case 'daily': {
      schedule = [{ at: `${daily}:00` }];
      break;
    }
    case 'weekly': {
      let daysOfWeek = Object.keys(weekly).reduce((acc, day) => {
        if (weekly[day]) acc.push(day);
        return acc;
      }, []);

      if (!daysOfWeek.length) daysOfWeek = ['mon'];

      schedule = [{ at: `${daily}:00`, on: daysOfWeek }];
      break;
    }
    case 'monthly': {
      schedule = [{ at: `${daily}:00`, on: +monthly.day }];
      break;
    }
    default: {
      // cron
      schedule = cron.split('\n');
      break;
    }
  }

  return {
    trigger: {
      schedule: {
        [frequency]: schedule,
        timezone: comboBoxOptionsToArray(timezone)[0],
      },
    },
  };
}
