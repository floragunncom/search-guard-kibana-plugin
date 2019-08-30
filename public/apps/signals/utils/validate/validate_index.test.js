import { validateIndex } from './validate_index';
import { mustSpecifyIndexText } from '../i18n/common';

describe('validate_index', () => {
  it('can validate index', () => {
    expect(validateIndex(['a'])).toBe(null);
    expect(validateIndex(['a', 'b'])).toBe(null);
  });

  it('fail to validate if no index specified', () => {
    expect(validateIndex([])).toBe(mustSpecifyIndexText);
  });
});
