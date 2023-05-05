/** @jest-environment jsdom */

import { validateMonthDay } from './validateMonthDay';
import { mustBeNumberBetween1And31Text } from '../../../../utils/i18n/common';

describe('validateMonthDay', () => {
  it('can validate number between 1-31', () => {
    expect(validateMonthDay(1)).toBe(null);
    expect(validateMonthDay(31)).toBe(null);
  });

  it('fail to validate values', () => {
    expect(validateMonthDay('aString')).toBe(mustBeNumberBetween1And31Text);
    expect(validateMonthDay(0)).toBe(mustBeNumberBetween1And31Text);
    expect(validateMonthDay(32)).toBe(mustBeNumberBetween1And31Text);
    expect(validateMonthDay(-1)).toBe(mustBeNumberBetween1And31Text);
    expect(validateMonthDay(1.5)).toBe(mustBeNumberBetween1And31Text);
  });
});
