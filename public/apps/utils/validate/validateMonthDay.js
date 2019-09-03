import { mustBeNumberBetween1And31Text } from '../i18n/common';

export const validateMonthDay = value => {
  if (!Number.isInteger(value) || (value < 1 || value > 31)) {
    return mustBeNumberBetween1And31Text;
  } else {
    return null;
  }
};
