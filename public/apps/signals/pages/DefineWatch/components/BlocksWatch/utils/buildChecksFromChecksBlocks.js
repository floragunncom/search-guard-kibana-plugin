import {
  StaticBlock,
  ConditionBlock,
  TransformBlock,
  CalcBlock,
  SearchBlock,
  HttpBlock,
} from './Blocks';

export const buildChecksFromChecksBlocks = (formikChecksBlocks = []) =>
  formikChecksBlocks.map(block => {
    if (block.type === StaticBlock.type) {
      return new StaticBlock(block).toWatchCheck();
    } else if (block.type === ConditionBlock.type || block.type === ConditionBlock.legacyType) {
      return new ConditionBlock(block).toWatchCheck();
    } else if (block.type === TransformBlock.type) {
      return new TransformBlock(block).toWatchCheck();
    } else if (block.type === CalcBlock.type) {
      return new CalcBlock(block).toWatchCheck();
    } else if (block.type === SearchBlock.type) {
      return new SearchBlock(block).toWatchCheck();
    } else if (block.type === HttpBlock.type) {
      return new HttpBlock(block).toWatchCheck();
    }
  });
