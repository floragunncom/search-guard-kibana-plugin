import { validateEmailAddr } from './validateEmailAddr';
import { invalidEmailAddressText, requiredText } from '../i18n/common';

describe('validateEmailAddr', () => {
  test('can validate email string', () => {
    expect(validateEmailAddr()('a@b')).toEqual(undefined);
  });

  test('fail to validate email', () => {
    expect(validateEmailAddr()('a@')).toEqual(invalidEmailAddressText);
    expect(validateEmailAddr()('@b')).toEqual(invalidEmailAddressText);
    expect(validateEmailAddr()('a')).toEqual(invalidEmailAddressText);
    expect(validateEmailAddr()('@')).toEqual(invalidEmailAddressText);
  });

  test('can validate email comboBox', () => {
    expect(validateEmailAddr()([
      { label: 'a@b' },
      { label: 'c@d' }
    ])).toEqual(undefined);
  });

  test('fail to validate email comboBox if some of the emails are wrong', () => {
    expect(validateEmailAddr()([
      { label: 'a@b' },
      { label: 'a' }
    ])).toEqual(invalidEmailAddressText);
  });

  test('require if email is empty', () => {
    expect(validateEmailAddr()('')).toEqual(requiredText);
    expect(validateEmailAddr()([])).toEqual(requiredText);
  });

  test('dont require if email is empty', () => {
    expect(validateEmailAddr(false)('')).toEqual(undefined);
    expect(validateEmailAddr(false)([])).toEqual(undefined);
  });
});
