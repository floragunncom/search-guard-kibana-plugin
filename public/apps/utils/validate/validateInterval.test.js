import { validateInterval } from './validateInterval';
import { mustBePositiveIntegerText } from '../i18n/common';

describe('validateInterval', () => {
  it('can validate positive integer', () => {
    expect(validateInterval(1)).toBe(null);
  });

  it('fail to validate values', () => {
    expect(validateInterval('aString')).toBe(mustBePositiveIntegerText);
    expect(validateInterval(0)).toBe(mustBePositiveIntegerText);
    expect(validateInterval(-1)).toBe(mustBePositiveIntegerText);
    expect(validateInterval(1.5)).toBe(mustBePositiveIntegerText);
  });
});
