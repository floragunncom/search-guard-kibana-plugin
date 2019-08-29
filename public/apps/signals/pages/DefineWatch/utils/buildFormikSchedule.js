import { SCHEDULE_DEFAULTS } from './constants';
import {
  matchTimeHHMM,
  matchDayOfMonth,
  matchTimePeriod,
  matchDayOfWeek,
  arrayToComboBoxOptions
} from '../../../utils/helpers';

export default function buildFormikSchedule(watch = {}) {
  const _frequency = Object.keys(watch.trigger.schedule)
    .filter(key => ['interval', 'daily', 'weekly', 'monthly', 'cron'].includes(key)).pop();
  const formikSchedule = { ...SCHEDULE_DEFAULTS, _frequency };

  if (watch.trigger.schedule.timezone) {
    formikSchedule._timezone = arrayToComboBoxOptions([watch.trigger.schedule.timezone]);
  }

  let watchSchedule = watch.trigger.schedule[_frequency];
  if (!Array.isArray(watchSchedule) || !watchSchedule.length) {
    return formikSchedule;
  };

  // Only the first array value is taken to be the schedule value in UI
  // TODO: UI desing must be improved to use multiple values
  watchSchedule = watchSchedule[0];

  switch (_frequency) {
    case 'interval': {
      const matched = matchTimePeriod(watchSchedule);
      if (matched) {
        formikSchedule._period = { interval: +matched[1], unit: matched[2] };
      }

      break;
    }
    case 'daily': {
      if (typeof watchSchedule.at !== 'string') break;

      const matched = matchTimeHHMM(watchSchedule.at);
      if (matched) {
        formikSchedule._daily = +matched[1];
      }

      break;
    }
    case 'weekly': {
      const daysOfWeek = Array.isArray(watchSchedule.on) ? watchSchedule.on : [watchSchedule.on];
      daysOfWeek.forEach(day => {
        if (matchDayOfWeek(day)) {
          const shortDay = day.slice(0, 3);
          formikSchedule._weekly[shortDay] = true;
        }
      });

      if (typeof watchSchedule.at !== 'string') break;

      const matched = matchTimeHHMM(watchSchedule.at);
      if (matched) {
        formikSchedule._daily = +matched[1];
      }

      break;
    }
    case 'monthly': {
      if (typeof watchSchedule.at !== 'string' || typeof watchSchedule.on !== 'number') break;

      if (matchDayOfMonth(watchSchedule.on+'')) {
        formikSchedule._monthly.day = watchSchedule.on;
      }

      const matched = matchTimeHHMM(watchSchedule.at);
      if (matched) {
        formikSchedule._daily = +matched[1];
      }

      break;
    }
    default: { // cron
      formikSchedule._cron = watchSchedule;
    }
  }

  return formikSchedule;
}
