import { validateEmptyArray } from './validateEmptyArray';
import { requiredText } from '../i18n/common';

describe('validateEmptyArray', () => {
  it('can validate', () => {
    expect(validateEmptyArray(['a'])).toBe(undefined);
  });

  it('fail to validate if array is empty', () => {
    expect(validateEmptyArray([])).toBe(requiredText);
  });
});
