/* eslint-disable @kbn/eslint/require-license-header */
import { validateEmptyComboBox } from './validateEmptyComboBox';
import { requiredText } from '../i18n/common';

describe('validateEmptyComboBox', () => {
  test('can validate ComboBox', () => {
    expect(validateEmptyComboBox([{ label: 'a' }])).toEqual(undefined);
  });

  test('fail to validate because ComboBox is not allowed to be empty', () => {
    expect(validateEmptyComboBox([])).toEqual(requiredText);
  });
});
