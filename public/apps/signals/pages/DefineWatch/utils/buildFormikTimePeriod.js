import { TIME_PERIOD_UNITS } from './constants';

const buildFormikTimePeriod = (timeInterval = '') => {
  const { SECONDS, MINUTES, HOURS, DAYS, WEEKS } = TIME_PERIOD_UNITS;
  const allUnitsRegex = new RegExp(`(\\d+${WEEKS})?(\\d+${DAYS})?(\\d+${HOURS})?(\\d+${MINUTES})?(\\d+${SECONDS})?`, 'gm');
  const secondsRegex = new RegExp(`^(\\d+)(${SECONDS})$`);
  const minutesRegex = new RegExp(`^(\\d+)(${MINUTES})$`);
  const hoursRegex = new RegExp(`^(\\d+)(${HOURS})$`);
  const daysRegex = new RegExp(`^(\\d+)(${DAYS})$`);
  const weeksRegex = new RegExp(`^(\\d+)(${WEEKS})$`);

  const result = {
    interval: null,
    unit: SECONDS,
  };

  const [weeks, days, hours, minutes, seconds] = timeInterval.split(allUnitsRegex).splice(1, 6);

  if (seconds) {
    const [, interval] = seconds.match(secondsRegex);
    result.interval = interval * 1;
  }

  if (minutes) {
    const [, interval] = minutes.match(minutesRegex);
    if (result.interval === null) {
      result.interval = interval * 1;
      result.unit = MINUTES;
    } else {
      result.interval += interval * 60;
    }
  }

  if (hours) {
    const [, interval] = hours.match(hoursRegex);
    if (result.interval === null) {
      result.interval = interval * 1;
      result.unit = HOURS;
    } else if (result.unit === MINUTES) {
      result.interval += interval * 60;
    } else {
      result.interval += interval * 60 * 60;
    }
  }

  if (days) {
    const [, interval] = days.match(daysRegex);
    if (result.interval === null) {
      result.interval = interval * 1;
      result.unit = DAYS;
    } else if (result.unit === HOURS) {
      result.interval += interval * 24;
    } else if (result.unit === MINUTES) {
      result.interval += interval * 24 * 60;
    } else {
      result.interval += interval * 24 * 60 * 60;
    }
  }

  if (weeks) {
    const [, interval] = weeks.match(weeksRegex);
    if (result.interval === null) {
      result.interval = interval * 1;
      result.unit = WEEKS;
    } else if (result.unit === DAYS) {
      result.interval += interval * 7;
    } else if (result.unit === HOURS) {
      result.interval += interval * 7 * 24;
    } else if (result.unit === MINUTES) {
      result.interval += interval * 7 * 24 * 60;
    } else {
      result.interval += interval * 7 * 24 * 60 * 60;
    }
  }

  return result;
};

export default buildFormikTimePeriod;
