import { validateEmptyArray } from './validate_empty_array';
import { requiredText } from '../i18n/common';

describe('validate_empty_array', () => {
  it('can validate', () => {
    expect(validateEmptyArray(['a'])).toBe(null);
  });

  it('fail to validate if array is empty', () => {
    expect(validateEmptyArray([])).toBe(requiredText);
  });
});
