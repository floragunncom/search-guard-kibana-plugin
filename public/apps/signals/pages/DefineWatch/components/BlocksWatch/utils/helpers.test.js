/* eslint-disable @kbn/eslint/require-license-header */
import { reorderBlocks, deleteBlock } from './helpers';

describe('BlocksWatch helpers', () => {
  test('reorderBlocks', () => {
    const list = [1, 2, 3];
    const startIndex = 0;
    const endIndex = 1;
    const result = [2, 1, 3];

    expect(JSON.stringify(reorderBlocks(list, startIndex, endIndex))).toBe(JSON.stringify(result));
  });

  test('deleteBlock', () => {
    const list = [1, 2, 3];
    const index = 1;
    const result = [1, 3];

    expect(JSON.stringify(deleteBlock(list, index))).toBe(JSON.stringify(result));
  });
});
