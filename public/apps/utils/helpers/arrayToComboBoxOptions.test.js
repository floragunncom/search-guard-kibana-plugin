import { arrayToComboBoxOptions } from './arrayToComboBoxOptions';

describe('arrayToComboBoxOptions', () => {
  test('can build comboBox options', () => {
    expect(arrayToComboBoxOptions()).toEqual([]);
    expect(arrayToComboBoxOptions(['a', 'b'])).toEqual([
      { label: 'a' },
      { label: 'b' }
    ]);
  });
});
