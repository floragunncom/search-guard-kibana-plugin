import { validateJsonString } from './validate_json_string';
import { requiredText, invalidJsonText } from '../i18n/common';

describe('validate_json_string', () => {
  it('can validate JSON', () => {
    expect(validateJsonString('{ "a": 1 }')).toBe(null);
  });

  it('fail to validate if no value', () => {
    expect(validateJsonString('')).toBe(requiredText);
    expect(validateJsonString()).toBe(requiredText);
  });

  it('fail to validate if JSON error', () => {
    expect(validateJsonString('"a": 1 }')).toBe(invalidJsonText);
  });
});
