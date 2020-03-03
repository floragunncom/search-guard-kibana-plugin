import { Block } from './Block';

export class CalcBlock extends Block {
  static get type() {
    return 'calc';
  }

  constructor({ id, name = '', target = '', response = '', source = '', lang = 'painless' }) {
    super({ id, name, target, response });
    this.source = source;
    this.lang = lang;
  }

  get type() {
    return CalcBlock.type;
  }

  toFormik() {
    return {
      type: CalcBlock.type,
      id: this.id,
      name: this.name,
      target: this.target,
      response: this.response,
      source: this.source,
      lang: this.lang,
    };
  }

  toWatchCheck() {
    const check = { type: CalcBlock.type, source: this.source };

    if (this.name) check.name = this.name;
    if (this.target) check.target = this.target;
    if (this.lang) check.lang = this.lang;

    return check;
  }
}
