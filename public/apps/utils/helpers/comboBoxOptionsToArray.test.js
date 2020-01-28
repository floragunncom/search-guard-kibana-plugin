import { comboBoxOptionsToArray } from './comboBoxOptionsToArray';

describe('comboBoxOptionsToArray', () => {
  test('can build array', () => {
    expect(comboBoxOptionsToArray()).toEqual([]);
    expect(comboBoxOptionsToArray([
      { label: 'a' },
      { label: 'b' }
    ])).toEqual(['a', 'b']);
  });
});
