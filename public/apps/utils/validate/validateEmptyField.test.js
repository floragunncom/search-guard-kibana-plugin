import { validateEmptyField } from './validateEmptyField';
import { requiredText } from '../i18n/common';

describe('validateEmptyField', () => {
  it('can validate text', () => {
    expect(validateEmptyField('abc')).toBe(undefined);
  });

  it('fail to validate if no value', () => {
    expect(validateEmptyField('')).toBe(requiredText);
    expect(validateEmptyField()).toBe(requiredText);
  });
});
