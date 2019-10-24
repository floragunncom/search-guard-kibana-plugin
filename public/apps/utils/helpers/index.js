import { CODE_EDITOR } from '../constants';

export { arrayToComboBoxOptions } from './arrayToComboBoxOptions';
export { comboBoxOptionsToArray } from './comboBoxOptionsToArray';
export { filterEmptyKeys } from './filterEmptyKeys';

export function stringifyPretty(obj) {
  return JSON.stringify(obj || '', null, CODE_EDITOR.TAB_SIZE);
}
