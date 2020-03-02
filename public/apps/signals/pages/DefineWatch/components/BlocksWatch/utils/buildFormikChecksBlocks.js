import { StaticBlock } from './Blocks'; 

export const buildFormikChecksBlocks = (checks = []) =>
  checks.map((checkValues, id) => {
    if (checkValues.type === StaticBlock.type) {
      return new StaticBlock({ id, ...checkValues }).toFormik();
    }

    return new StaticBlock({
      id,
      value: {
        error: `Unknown block type "${checkValues.type}"! Please report to developers. Defaults to static type.`,
      },
    }).toFormik();
  });
