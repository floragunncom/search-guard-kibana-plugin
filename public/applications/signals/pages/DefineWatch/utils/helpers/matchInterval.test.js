import { matchInterval } from './matchInterval';

describe('matchInterval', () => {
  const correctNumbers = [
    '10ms',
    '10s',
    '10m',
    '10h',
    '10d',
    '10w',
    '0',
  ];

  const wrongNumbers = [
    '1h30m',
    '1w1d1h1m1s1ms',
    '10.5',
    '10.5ms',
    '1m1h',
    '1wdhmsms',
  ];

  test.each(correctNumbers)('should match %i', num => {
    expect(matchInterval(num)).not.toEqual(null);
  });

  test.each(wrongNumbers)('should not match %i', num => {
    expect(matchInterval(num)).toEqual(null);
  });
});
