import { cloneDeep } from 'lodash';
import { arrayToComboBoxOptions } from '../../../utils/helpers';
import { SCHEDULE_DEFAULTS } from './constants';
import { buildTimePeriod } from './helpers';

export default function buildFormikSchedule(watch = {}) {
  const matchTimeHHMM = timeStr => timeStr.match(/^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9](?::[0-5][0-9])?$/);
  const matchDayOfMonth = dayOfMonthStr => (dayOfMonthStr + '').match(/^([1-9]|[12]\d|3[01])$/);
  const matchDayOfWeek = dayOfWeekStr => dayOfWeekStr.match(/\b((mon|tues|wed(nes)?|thu(rs)?|fri|sat(ur)?|sun)(day)?)\b/);

  const frequency = Object.keys(watch.trigger.schedule)
    .filter(key => ['interval', 'daily', 'weekly', 'monthly', 'cron'].includes(key)).pop();
  const formikSchedule = { ...cloneDeep(SCHEDULE_DEFAULTS), frequency };

  if (watch.trigger.schedule.timezone) {
    formikSchedule.timezone = arrayToComboBoxOptions([watch.trigger.schedule.timezone]);
  }

  const watchSchedule = watch.trigger.schedule[frequency];

  // ATTENTION! Only the first array value is taken to be the schedule value in UI
  // TODO: UI design must be improved to use multiple values
  switch (frequency) {
    case 'interval': {
      const interval = Array.isArray(watchSchedule) ? watchSchedule[0] : watchSchedule;
      formikSchedule.period = buildTimePeriod(interval);
      break;
    }
    case 'daily': {
      const daily = Array.isArray(watchSchedule) ? watchSchedule[0] : watchSchedule;
      const atHour = Array.isArray(daily.at) ? daily.at[0] : daily.at;
      const [, hours] = matchTimeHHMM(atHour);
      if (hours) {
        formikSchedule.daily = +hours;
      }

      break;
    }
    case 'weekly': {
      const weekly = Array.isArray(watchSchedule) ? watchSchedule[0] : watchSchedule;
      const daysOfWeek = Array.isArray(weekly.on) ? weekly.on : [weekly.on];

      daysOfWeek.forEach(day => {
        if (matchDayOfWeek(day)) {
          const shortDay = day.slice(0, 3);
          formikSchedule.weekly[shortDay] = true;
        }
      });

      const daily = Array.isArray(weekly.at) ? weekly.at[0] : weekly.at;
      const [, hours] = matchTimeHHMM(daily);
      if (hours) {
        formikSchedule.daily = +hours;
      }

      break;
    }
    case 'monthly': {
      const monthly = Array.isArray(watchSchedule) ? watchSchedule[0] : watchSchedule;
      const onDay = Array.isArray(monthly.on) ? monthly.on[0] : monthly.on;
      const atHour = Array.isArray(monthly.at) ? monthly.at[0] : monthly.at;

      if (matchDayOfMonth(onDay + '')) {
        formikSchedule.monthly.day = onDay;
      }

      const [, daily] = matchTimeHHMM(atHour);
      if (daily) {
        formikSchedule.daily = +daily;
      }

      break;
    }
    default: { // cron
      const cron = Array.isArray(watchSchedule) ? watchSchedule.join('\n') : watchSchedule;
      formikSchedule.cron = cron;
    }
  }

  return formikSchedule;
}
