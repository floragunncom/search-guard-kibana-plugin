import { mustBePositiveIntegerText } from '../../../../utils/i18n/common';

export const validateInterval = value => {
  return value < 0 || !Number.isInteger(value) ? mustBePositiveIntegerText : null;
};
