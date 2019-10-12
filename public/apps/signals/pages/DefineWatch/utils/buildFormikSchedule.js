import { cloneDeep } from 'lodash';
import {
  matchTimeHHMM,
  matchDayOfMonth,
  matchDayOfWeek,
  arrayToComboBoxOptions
} from '../../../utils/helpers';
import { SCHEDULE_DEFAULTS } from './constants';
import buildFormikTimePeriod from './buildFormikTimePeriod';

export default function buildFormikSchedule(watch = {}) {
  const frequency = Object.keys(watch.trigger.schedule)
    .filter(key => ['interval', 'daily', 'weekly', 'monthly', 'cron'].includes(key)).pop();
  const formikSchedule = { ...cloneDeep(SCHEDULE_DEFAULTS), frequency };

  if (watch.trigger.schedule.timezone) {
    formikSchedule.timezone = arrayToComboBoxOptions([watch.trigger.schedule.timezone]);
  }

  let watchSchedule = watch.trigger.schedule[frequency];
  if (!Array.isArray(watchSchedule) || !watchSchedule.length) {
    return formikSchedule;
  }

  // Only the first array value is taken to be the schedule value in UI
  // TODO: UI desing must be improved to use multiple values
  watchSchedule = watchSchedule[0];

  switch (frequency) {
    case 'interval': {
      formikSchedule.period = buildFormikTimePeriod(watchSchedule);
      break;
    }
    case 'daily': {
      if (typeof watchSchedule.at !== 'string') break;

      const matched = matchTimeHHMM(watchSchedule.at);
      if (matched) {
        formikSchedule.daily = +matched[1];
      }

      break;
    }
    case 'weekly': {
      const daysOfWeek = Array.isArray(watchSchedule.on) ? watchSchedule.on : [watchSchedule.on];
      daysOfWeek.forEach(day => {
        if (matchDayOfWeek(day)) {
          const shortDay = day.slice(0, 3);
          formikSchedule.weekly[shortDay] = true;
        }
      });

      if (typeof watchSchedule.at !== 'string') break;

      const matched = matchTimeHHMM(watchSchedule.at);
      if (matched) {
        formikSchedule.daily = +matched[1];
      }

      break;
    }
    case 'monthly': {
      if (typeof watchSchedule.at !== 'string' || typeof watchSchedule.on !== 'number') break;

      if (matchDayOfMonth(watchSchedule.on + '')) {
        formikSchedule.monthly.day = watchSchedule.on;
      }

      const matched = matchTimeHHMM(watchSchedule.at);
      if (matched) {
        formikSchedule.daily = +matched[1];
      }

      break;
    }
    default: { // cron
      formikSchedule.cron = watchSchedule;
    }
  }

  return formikSchedule;
}
