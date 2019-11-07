import { validateAdvancedInterval } from './validateAdvancedInterval';
import { requiredText } from '../../../../utils/i18n/common';
import { invalidTimeIntervalText } from '../../../../utils/i18n/watch';

describe('validateAdvancedInterval', () => {
  it('can validate', () => {
    const numbers = [
      '10ms',
      '1h30m',
      '1w1d1h1m1s1ms',
    ];

    for (let i = 0; i < numbers.length; i++) {
      expect(validateAdvancedInterval(numbers[i])).toEqual(null);
    }
  });

  it('fail to validate', () => {
    const numbers = [
      '10',
      '10.5',
      '10.5ms',
      '1m1h',
      '1wdhmsms',
    ];

    for (let i = 0; i < numbers.length; i++) {
      expect(validateAdvancedInterval(numbers[i])).toEqual(invalidTimeIntervalText);
    }
  });

  it('fail to validate undefined', () => {
    expect(validateAdvancedInterval(undefined)).toEqual(requiredText);
  });
});
