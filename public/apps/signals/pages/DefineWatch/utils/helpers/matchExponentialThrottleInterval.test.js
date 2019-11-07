import { matchExponentialThrottleInterval } from './matchExponentialThrottleInterval';

describe('matchExpnentialThrottleInterval', () => {
  test('should match', () => {
    const numbers = [
      '1m**2',
      '1m**2|1h',
      '1m**2.2|1h',
      '1142124m**2214124.2142142|114124h',
      '1w1d1h1m1s1ms**2|2w2d2h2m2s2ms',
    ];

    for (let i = 0; i < numbers.length; i++) {
      if (!matchExponentialThrottleInterval(numbers[i])) {
        console.log('matchExponentialThrottleInterval', numbers[i], matchExponentialThrottleInterval(numbers[i]))
      }
      expect(matchExponentialThrottleInterval(numbers[i])).not.toEqual(null);
    }
  });

  test('should not match', () => {
    const numbers = [
      '12',
      '12.2',
      '1s',
      '1m2h',
      '1h1m**2|',
      '1h1m**2|1',
      '1m1h**2|1h',
      '1m**2|1m1h',
      '1wdhmsms**2|2wdhmsms',
    ];

    for (let i = 0; i < numbers.length; i++) {
      expect(matchExponentialThrottleInterval(numbers[i])).toEqual(null);
    }
  });
});
