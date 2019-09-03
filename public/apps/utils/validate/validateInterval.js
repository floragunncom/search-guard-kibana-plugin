import { mustBePositiveIntegerText } from '../i18n/common';

export const validateInterval = value => {
  return value < 1 || !Number.isInteger(value) ? mustBePositiveIntegerText : null;
};
