import { isInvalid } from './isInvalid';

describe('isInvalid', () => {
  test('is invalid when field touched and there is error', () => {
    expect(isInvalid('a', {
      touched: { a: true },
      errors: { a: true }
    })).toBe(true);

    expect(isInvalid('a.b', {
      touched: { a: { b: true } },
      errors: { a: { b: true } }
    })).toBe(true);

    expect(isInvalid('a[0]b', {
      touched: { a: [ { b: true } ] },
      errors: { a: [ { b: true } ] }
    })).toBe(true);
  });

  test('is valid when there is no error', () => {
    expect(isInvalid('a', {
      touched: {},
      errors: {}
    })).toBe(false);
  });
});
