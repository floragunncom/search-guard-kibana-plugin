import { matchExponentialThrottleInterval, matchAdvancedInterval } from '../helpers';
import { requiredText } from '../../../../utils/i18n/common';
import { invalidThrottleTimeIntervalText } from '../../../../utils/i18n/watch';

export const validateThrottleAdvancedInterval = value => {
  if (!value) return requiredText;
  return !matchExponentialThrottleInterval(value) && !matchAdvancedInterval(value) ? invalidThrottleTimeIntervalText : null;
};
