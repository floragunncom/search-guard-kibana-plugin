/* eslint-disable @kbn/eslint/require-license-header */
export function reorderBlocks(list, startIndex, endIndex) {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export function deleteBlock(list, index) {
  const result = [...list];
  result.splice(index, 1);
  return result;
}
