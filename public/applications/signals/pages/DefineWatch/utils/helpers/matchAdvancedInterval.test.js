import { matchAdvancedInterval } from './matchAdvancedInterval';

describe('matchAdvancedInterval', () => {
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

  test.each(correctNumbers)('should match %i', num => {
    expect(matchAdvancedInterval(num)).not.toEqual(null);
  });

  test.each(wrongNumbers)('should not match %i', num => {
    expect(matchAdvancedInterval(num)).toEqual(null);
  });
});
