import { validateEmptyField } from './validate_empty_field';
import { requiredText } from '../i18n/common';

describe('validate_empty_field', () => {
  it('can validate text', () => {
    expect(validateEmptyField('abc')).toBe(null);
  });

  it('fail to validate if no value', () => {
    expect(validateEmptyField('')).toBe(requiredText);
    expect(validateEmptyField()).toBe(requiredText);
  });
});
