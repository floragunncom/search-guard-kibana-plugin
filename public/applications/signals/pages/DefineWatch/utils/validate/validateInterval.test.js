/** @jest-environment jsdom */

import { validateInterval } from './validateInterval';
import { mustBePositiveIntegerText } from '../../../../utils/i18n/common';

describe('validateInterval', () => {
  it('can validate positive integer', () => {
    expect(validateInterval(0)).toBe(null);
    expect(validateInterval(1)).toBe(null);
  });

  it('fail to validate values', () => {
    expect(validateInterval('string')).toBe(mustBePositiveIntegerText);
    expect(validateInterval(-1)).toBe(mustBePositiveIntegerText);
    expect(validateInterval(1.5)).toBe(mustBePositiveIntegerText);
  });
});
