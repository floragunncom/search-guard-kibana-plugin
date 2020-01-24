import { mustSpecifyIndexText } from '../../../../utils/i18n/watch';

export const validateIndex = (options = []) => {
  return !Array.isArray(options) || !options.length ? mustSpecifyIndexText : null;
};
