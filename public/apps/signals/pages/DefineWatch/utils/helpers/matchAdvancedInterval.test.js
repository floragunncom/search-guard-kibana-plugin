import { matchAdvancedInterval } from './matchAdvancedInterval';

describe('matchAdvancedInterval', () => {
  test('should match', () => {
    const numbers = [
      '10ms',
      '1h30m',
      '1w1d1h1m1s1ms',
    ];

    for (let i = 0; i < numbers.length; i++) {
      expect(matchAdvancedInterval(numbers[i])).not.toEqual(null);
    }
  });

  test('should not match', () => {
    const numbers = [
      '10',
      '10.5',
      '10.5ms',
      '1m1h',
      '1wdhmsms',
    ];

    for (let i = 0; i < numbers.length; i++) {
      expect(matchAdvancedInterval(numbers[i])).toEqual(null);
    }
  });
});
