import { TIME_PERIOD_UNITS } from '../constants';

const timeUnits = Object.values(TIME_PERIOD_UNITS).join('|');

export const matchInterval = timeString => timeString.match(new RegExp(`^(\\d+)(${timeUnits})?$`));