import { validateInterval } from './validate_interval';
import { mustBePositiveIntegerText } from '../i18n/common';

describe('validate_interval', () => {
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
