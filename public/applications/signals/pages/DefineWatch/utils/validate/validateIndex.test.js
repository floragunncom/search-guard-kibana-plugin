/** @jest-environment jsdom */

import { validateIndex } from './validateIndex';
import { mustSpecifyIndexText } from '../../../../utils/i18n/watch';

describe('validateIndex', () => {
  it('can validate index', () => {
    expect(validateIndex(['a'])).toBe(null);
    expect(validateIndex(['a', 'b'])).toBe(null);
  });

  it('fail to validate if no index specified', () => {
    expect(validateIndex([])).toBe(mustSpecifyIndexText);
  });
});
