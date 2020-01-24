import { validateAdvancedInterval } from './validateAdvancedInterval';
import { requiredText } from '../../../../utils/i18n/common';
import { invalidTimeIntervalText } from '../../../../utils/i18n/watch';

describe('validateAdvancedInterval', () => {
  const correctNumbers = [
    '10ms',
    '1h30m',
    '1w1d1h1m1s1ms',
  ];

  const wrongNumbers = [
    '10',
    '10.5',
    '10.5ms',
    '1m1h',
    '1wdhmsms',
  ];

  test.each(correctNumbers)('can validate %i', num => {
    expect(validateAdvancedInterval(num)).toEqual(null);
  });

  test.each(wrongNumbers)('fail to validate %i', num => {
    expect(validateAdvancedInterval(num)).toEqual(invalidTimeIntervalText);
  });

  test('fail to validate undefined', () => {
    expect(validateAdvancedInterval(undefined)).toEqual(requiredText);
  });
});
