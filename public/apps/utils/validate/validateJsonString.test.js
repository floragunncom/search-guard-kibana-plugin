import { validateJsonString } from './validateJsonString';
import { requiredText, invalidJsonText } from '../i18n/common';

describe('validateJsonString', () => {
  it('can validate JSON', () => {
    expect(validateJsonString('{ "a": 1 }')).toBe(undefined);
  });

  it('fail to validate if no value', () => {
    expect(validateJsonString('')).toBe(requiredText);
    expect(validateJsonString()).toBe(requiredText);
  });

  it('fail to validate if JSON error', () => {
    expect(validateJsonString('"a": 1 }')).toBe(invalidJsonText);
  });
});
