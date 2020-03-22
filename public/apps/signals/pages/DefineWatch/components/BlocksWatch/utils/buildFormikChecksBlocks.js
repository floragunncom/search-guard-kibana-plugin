/* eslint-disable @kbn/eslint/require-license-header */
import {
  StaticBlock,
  ConditionBlock,
  TransformBlock,
  CalcBlock,
  SearchBlock,
  HttpBlock,
} from './Blocks';

export const buildFormikChecksBlocks = (checks = []) =>
  checks.map(({ type, ...rest }, id) => {
    if (type === StaticBlock.type) {
      return new StaticBlock({ id, ...rest }).toFormik();
    } else if (type === ConditionBlock.type || type === ConditionBlock.legacyType) {
      return new ConditionBlock({ id, ...rest }).toFormik();
    } else if (type === TransformBlock.type) {
      return new TransformBlock({ id, ...rest }).toFormik();
    } else if (type === CalcBlock.type) {
      return new CalcBlock({ id, ...rest }).toFormik();
    } else if (type === SearchBlock.type) {
      return new SearchBlock({ id, ...rest }).toFormik();
    } else if (type === HttpBlock.type) {
      return new HttpBlock({ id, ...rest }).toFormik();
    }

    return new StaticBlock({
      id,
      value: {
        error: `Unknown block type "${type}"! Please report to developers. Defaults to static type.`,
      },
    }).toFormik();
  });
