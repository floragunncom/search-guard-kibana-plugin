import { StaticBlock } from './Blocks';

export const buildChecksFromChecksBlocks = (formikChecksBlocks = []) =>
  formikChecksBlocks.map(block => {
    if (block.type === StaticBlock.type) {
      return new StaticBlock(block).toWatchCheck();
    }
  });
