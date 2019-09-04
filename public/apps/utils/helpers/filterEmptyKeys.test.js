import { filterEmptyKeys } from './filterEmptyKeys';

describe('filterEmptyKeys', () => {
  test('can filter out empty keys', () => {
    expect(filterEmptyKeys({
      bool_true: true,
      bool_false: false,
      arr_empty: [],
      obj_empty: {},
      num: 1,
      arr: [1, 2],
      obj: { a: 1 },
      str_empty: '',
      str: 'str',
      null: null,
      undefined: undefined
    })).toEqual({
      bool_true: true,
      bool_false: false,
      num: 1,
      arr: [1, 2],
      obj: { a: 1 },
      str: 'str'
    });
  });
});
