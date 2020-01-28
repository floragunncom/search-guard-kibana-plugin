export const isNameHasProhibitedSpecialChars = (name = '') => (/[^\w\s_-]+/gm).test(name);

export {
  arrayToComboBoxOptions,
  comboBoxOptionsToArray,
  filterEmptyKeys,
  stringifyPretty
} from '../../../utils/helpers';

export { foldMultiLineString } from './foldMultiLineString';
export { unfoldMultiLineString } from './unfoldMultiLineString';
