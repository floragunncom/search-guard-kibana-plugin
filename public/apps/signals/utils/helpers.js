import { CODE_EDITOR } from './constants';

export function stringifyPretty(obj) {
  return JSON.stringify(obj || '', null, CODE_EDITOR.TAB_SIZE);
}

export const isNameHasProhibitedSpecialChars = (name = '') => (/[^\w\s_-]+/gm).test(name);

export const arrayToComboBoxOptions = (array = []) =>
  array.map(label => ({ label })).sort((a, b) => a.label.localeCompare(b.label));

export const comboBoxOptionsToArray = (array = []) =>
  array.map(({ label }) => label).sort((a, b) => a.localeCompare(b));

export const matchTimeHHMM = timeStr => timeStr.match(/^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$/);
export const matchDayOfMonth = dayOfMonthStr => (dayOfMonthStr + '').match(/^([1-9]|[12]\d|3[01])$/);
export const matchTimePeriod = timePeriodStr => timePeriodStr.match(/(\d+)([YMwdhms])$/);
export const matchDayOfWeek = dayOfWeekStr => dayOfWeekStr.match(/\b((mon|tues|wed(nes)?|thu(rs)?|fri|sat(ur)?|sun)(day)?)\b/);
