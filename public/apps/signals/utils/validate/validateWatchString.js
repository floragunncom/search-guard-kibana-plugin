import { foldMultiLineString } from '../helpers';
import { requiredText, invalidJsonText } from '../i18n/common';

export const validateWatchString = value => {
  if (!value) return requiredText;

  try {
    JSON.parse(foldMultiLineString(value));
  } catch (error) {
    return invalidJsonText;
  }

  return null;
};
