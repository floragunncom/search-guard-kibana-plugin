import { mustSpecifyIndexText } from '../i18n/common';

export const validateIndex = (options = []) => {
  return !Array.isArray(options) || !options.length ? mustSpecifyIndexText : null;
};
