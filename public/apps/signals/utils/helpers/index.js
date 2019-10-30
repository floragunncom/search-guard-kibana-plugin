export const isNameHasProhibitedSpecialChars = (name = '') => (/[^\w\s_-]+/gm).test(name);

export const matchTimeHHMM = timeStr => timeStr.match(/^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$/);
export const matchDayOfMonth = dayOfMonthStr => (dayOfMonthStr + '').match(/^([1-9]|[12]\d|3[01])$/);
export const matchDayOfWeek = dayOfWeekStr => dayOfWeekStr.match(/\b((mon|tues|wed(nes)?|thu(rs)?|fri|sat(ur)?|sun)(day)?)\b/);

export const normalizeScriptValue = check => check.replace(/(""")/gm, '"');

export {
  arrayToComboBoxOptions,
  comboBoxOptionsToArray,
  filterEmptyKeys,
  stringifyPretty
} from '../../../utils/helpers';

export { foldMultiLineString } from './foldMultiLineString';
export { unfoldMultiLineString } from './unfoldMultiLineString';
