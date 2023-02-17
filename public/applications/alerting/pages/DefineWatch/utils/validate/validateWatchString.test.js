/** @jest-environment jsdom */

import { validateWatchString } from './validateWatchString';
import { requiredText, invalidJsonText } from '../../../../utils/i18n/common';

describe('validateWatchString', () => {
  it('can validate JSON', () => {
    expect(validateWatchString('{ "a": 1 }')).toBe(null);
  });

  it('can validate """', () => {
    expect(validateWatchString('{ "script": """ifelse""" }')).toBe(null);
  });

  it('fail to validate if no value', () => {
    expect(validateWatchString('')).toBe(requiredText);
    expect(validateWatchString()).toBe(requiredText);
  });

  it('fail to validate if JSON error', () => {
    expect(validateWatchString('"a": 1 }')).toBe(invalidJsonText);
  });
});
