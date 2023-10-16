/** @jest-environment jsdom */

import { validateEmailAddrWithName } from './validateEmailAddrWithName';
import { invalidEmailAddressText, requiredText } from '../i18n/common';

describe('validateEmailAddr', () => {
  test.each([
    ['"John Doe" <a@b>'],
    ["John <a@b>"],
    ["John Doe <a@b>"],
    ["a@b"]
  ])('can validate email string %p', (value) => {
    expect(validateEmailAddrWithName()(value)).toBeNull();
  });

  test.each([
    ['a@'],
    ['Tom <a@b'],
    ['John Doe c@d'],
    ['@b'],
    ['a'],
    ['@'],
  ])('fail to validate email with %p', (value) => {
    expect(validateEmailAddrWithName()(value)).toEqual(invalidEmailAddressText)
  });

  test('can validate email comboBox', () => {
    expect(validateEmailAddrWithName()([
      { label: '"John Doe" <a@b>' },
      { label: 'John <a@b>' },
      { label: 'a@b' }
    ])).toBeNull();
  });

  test('fail to validate email comboBox if some of the emails are wrong', () => {
    expect(validateEmailAddrWithName()([
      { label: 'a' },
      { label: 'John Doe <a@b>' }
    ])).toEqual(invalidEmailAddressText);
  });

  test('require if email is empty', () => {
    expect(validateEmailAddrWithName()('')).toEqual(requiredText);
    expect(validateEmailAddrWithName()([])).toEqual(requiredText);
  });

  test('dont require if email is empty', () => {
    expect(validateEmailAddrWithName(false)('')).toBeNull();
    expect(validateEmailAddrWithName(false)([])).toBeNull();
  });
});
