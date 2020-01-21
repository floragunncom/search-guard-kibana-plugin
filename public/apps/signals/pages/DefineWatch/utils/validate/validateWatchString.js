import { foldMultiLineString } from '../../../../utils/helpers';
import { requiredText, invalidJsonText } from '../../../../utils/i18n/common';

export const validateWatchString = value => {
  if (!value) return requiredText;

  try {
    JSON.parse(foldMultiLineString(value));
  } catch (error) {
    return invalidJsonText;
  }

  return null;
};
