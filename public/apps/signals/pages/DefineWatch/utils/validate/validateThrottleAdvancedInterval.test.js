import { validateThrottleAdvancedInterval } from './validateThrottleAdvancedInterval';
import { requiredText } from '../../../../utils/i18n/common';
import { invalidThrottleTimeIntervalText } from '../../../../utils/i18n/watch';

describe('validateThrottleAdvancedInterval', () => {
  it('can validate', () => {
    const numbers = [
      '1s',
      '1h30m',
      '1m**2',
      '1m**2|1h',
      '1m**2.2|1h',
      '1142124m**2214124.2142142|114124h',
      '1w1d1h1m1s1ms**2|2w2d2h2m2s2ms',
    ];

    for (let i = 0; i < numbers.length; i++) {
      expect(validateThrottleAdvancedInterval(numbers[i])).toEqual(null);
    }
  });

  it('fail to validate', () => {
    const numbers = [
      '12',
      '12.2',
      '1m2h',
      '1h1m**2|',
      '1h1m**2|1',
      '1m1h**2|1h',
      '1m**2|1m1h',
      '1wdhmsms**2|2wdhmsms',
    ];

    for (let i = 0; i < numbers.length; i++) {
      expect(validateThrottleAdvancedInterval(numbers[i])).toEqual(invalidThrottleTimeIntervalText);
    }
  });

  it('fail to validate undefined', () => {
    expect(validateThrottleAdvancedInterval(undefined)).toEqual(requiredText);
  });
});
