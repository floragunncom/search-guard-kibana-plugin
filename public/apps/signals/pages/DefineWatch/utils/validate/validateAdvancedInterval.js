import { matchAdvancedInterval } from '../helpers';
import { invalidTimeIntervalText } from '../../../../utils/i18n/watch';
import { requiredText } from '../../../../utils/i18n/common';

export const validateAdvancedInterval = value => {
  if (!value) return requiredText;
  return !matchAdvancedInterval(value) ? invalidTimeIntervalText : null;
}
