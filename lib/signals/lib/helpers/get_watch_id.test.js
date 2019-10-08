import { getWatchId } from './get_watch_id';

describe('get_watch_id', () => {
  it('can omit tenant name', () => {
    expect(getWatchId('tenant/watch')).toBe('watch');
  });

  it('can return watch name if there is no tenant name', () => {
    expect(getWatchId('watch')).toBe('watch');
  });
});
