/* eslint-disable @kbn/eslint/require-license-header */
import { getId } from './get_id';

describe('get_watch_id', () => {
  it('can omit tenant name', () => {
    expect(getId('tenant/watch')).toBe('watch');
  });

  it('can return watch name if there is no tenant name', () => {
    expect(getId('watch')).toBe('watch');
  });
});
