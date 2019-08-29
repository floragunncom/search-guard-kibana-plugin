import { comboBoxOptionsToArray } from '../../../utils/helpers';

export default function buildSchedule(watch) {
  const { _frequency } = watch;

  let schedule;
  switch (_frequency) {
    case 'interval': {
      schedule = [watch._period.interval + watch._period.unit];
      break;
    }
    case 'daily': {
      schedule = [{ at: `${watch._daily}:00` }];
      break;
    }
    case 'weekly': {
      let daysOfWeek = Object.keys(watch._weekly).reduce((acc, day) => {
        if (watch._weekly[day]) acc.push(day);
        return acc;
      }, []);

      if (!daysOfWeek.length) daysOfWeek = ['mon'];

      schedule = [{ at: `${watch._daily}:00`, on: daysOfWeek }];
      break;
    }
    case 'monthly': {
      schedule = [{ at: `${watch._daily}:00`, on: +watch._monthly.day }];
      break;
    }
    default: { // cron
      schedule = [watch._cron];
      break;
    }
  }

  return {
    trigger: {
      schedule: {
        [_frequency]: schedule,
        timezone: comboBoxOptionsToArray(watch._timezone)[0]
      }
    }
  };
}
