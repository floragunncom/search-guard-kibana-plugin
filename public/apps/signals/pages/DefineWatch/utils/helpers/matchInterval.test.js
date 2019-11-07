import { matchInterval } from './matchInterval';

describe('matchInterval', () => {
  test('should match', () => {
    const numbers = [
      '10ms',
      '10s',
      '10m',
      '10h',
      '10d',
      '10w',
      '0',
    ];

    for (let i = 0; i < numbers.length; i++) {
      expect(matchInterval(numbers[i])).not.toEqual(null);
    }
  });

  test('should not match', () => {
    const numbers = [
      '1h30m',
      '1w1d1h1m1s1ms',
      '10.5',
      '10.5ms',
      '1m1h',
      '1wdhmsms',
    ];

    for (let i = 0; i < numbers.length; i++) {
      expect(matchInterval(numbers[i])).toEqual(null);
    }
  });
});
