/** @jest-environment jsdom */
/* eslint-disable @kbn/eslint/require-license-header */
import { validateJsonOptionalString } from './validateJsonOptionalString';
import { invalidJsonText } from '../i18n/common';

describe('validateJsonOptionalString', () => {
  it('can validate JSON', () => {
    expect(validateJsonOptionalString('{ "a": 1 }')).toBe(null);
  });

  it('can validate empty string', () => {
    expect(validateJsonOptionalString('')).toBe(null);
  });

  it('fail to validate if JSON error', () => {
    expect(validateJsonOptionalString('"a": 1 }')).toBe(invalidJsonText);
  });
});
