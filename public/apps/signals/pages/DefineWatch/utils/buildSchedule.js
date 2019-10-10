import { comboBoxOptionsToArray } from '../../../utils/helpers';

// export default function buildSchedule(watch) {
export default function buildSchedule({
  frequency,
  period,
  daily,
  weekly,
  monthly,
  cron,
  timezone,
}) {
  let schedule;

  switch (frequency) {
    case 'interval': {
      schedule = [period.interval + period.unit];
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
    default: { // cron
      schedule = [cron];
      break;
    }
  }

  return {
    trigger: {
      schedule: {
        [frequency]: schedule,
        timezone: comboBoxOptionsToArray(timezone)[0]
      }
    }
  };
}
