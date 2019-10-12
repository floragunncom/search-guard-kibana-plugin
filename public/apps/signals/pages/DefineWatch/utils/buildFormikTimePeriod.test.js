import buildFormikTimePeriod from './buildFormikTimePeriod';

describe('buildFormikTimePeriod', () => {
  test('get 1s', () => {
    expect(buildFormikTimePeriod('1s')).toEqual({ interval: 1, unit: 's' });
  });

  test('get 1m', () => {
    expect(buildFormikTimePeriod('1m')).toEqual({ interval: 1, unit: 'm' });
  });

  test('get 1m1s', () => {
    expect(buildFormikTimePeriod('1m1s')).toEqual({ interval: 61, unit: 's' });
  });

  test('get 1h', () => {
    expect(buildFormikTimePeriod('1h')).toEqual({ interval: 1, unit: 'h' });
  });

  test('get 1h1s', () => {
    expect(buildFormikTimePeriod('1h1s')).toEqual({ interval: 3601, unit: 's' });
  });

  test('get 1h1m', () => {
    expect(buildFormikTimePeriod('1h1m')).toEqual({ interval: 61, unit: 'm' });
  });

  test('get 1h1m1s', () => {
    expect(buildFormikTimePeriod('1h1m1s')).toEqual({ interval: 3661, unit: 's' });
  });

  test('get 1d', () => {
    expect(buildFormikTimePeriod('1d')).toEqual({ interval: 1, unit: 'd' });
  });

  test('get 1d1s', () => {
    expect(buildFormikTimePeriod('1d1s')).toEqual({ interval: 86401, unit: 's' });
  });

  test('get 1d1m', () => {
    expect(buildFormikTimePeriod('1d1m')).toEqual({ interval: 1441, unit: 'm' });
  });

  test('get 1d1h', () => {
    expect(buildFormikTimePeriod('1d1h')).toEqual({ interval: 25, unit: 'h' });
  });

  test('get 1d1h1m', () => {
    expect(buildFormikTimePeriod('1d1h1m')).toEqual({ interval: 1501, unit: 'm' });
  });

  test('get 1d1h1m1s', () => {
    expect(buildFormikTimePeriod('1d1h1m1s')).toEqual({ interval: 90061, unit: 's' });
  });

  test('get 1w', () => {
    expect(buildFormikTimePeriod('1w')).toEqual({ interval: 1, unit: 'w' });
  });

  test('get 1w1s', () => {
    expect(buildFormikTimePeriod('1w1s')).toEqual({ interval: 604801, unit: 's' });
  });

  test('get 1w1m', () => {
    expect(buildFormikTimePeriod('1w1m')).toEqual({ interval: 10081, unit: 'm' });
  });

  test('get 1w1h', () => {
    expect(buildFormikTimePeriod('1w1h')).toEqual({ interval: 169, unit: 'h' });
  });

  test('get 1w1d', () => {
    expect(buildFormikTimePeriod('1w1d')).toEqual({ interval: 8, unit: 'd' });
  });

  test('get 1w1d1h', () => {
    expect(buildFormikTimePeriod('1w1d1h')).toEqual({ interval: 193, unit: 'h' });
  });

  test('get 1w1d1h1m', () => {
    expect(buildFormikTimePeriod('1w1d1h1m')).toEqual({ interval: 11581, unit: 'm' });
  });

  test('get 1w1d1h1m1s', () => {
    expect(buildFormikTimePeriod('1w1d1h1m1s')).toEqual({ interval: 694861, unit: 's' });
  });
});
