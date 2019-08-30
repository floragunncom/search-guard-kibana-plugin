import { hasError } from './has_error';

describe('has_error', () => {
  it('has error', () => {
    expect(hasError('a', {
      errors: { a: 'error' }
    })).toBe('error');

    expect(hasError('a.b', {
      errors: { a: { b: 'error' } }
    })).toBe('error');

    expect(hasError('a[0].b', {
      errors: { a: [ { b: 'error' } ] }
    })).toBe('error');
  });

  it('has no error', () => {
    expect(hasError('a', { errors: {} })).toBe(undefined);
  });
});
