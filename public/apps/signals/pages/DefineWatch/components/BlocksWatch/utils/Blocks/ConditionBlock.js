import { Block } from './Block';

export class ConditionBlock extends Block {
  static get type() {
    return 'condition';
  }

  // TODO: remove this when the docs fixed
  // https://docs.search-guard.com/latest/elasticsearch-alerting-conditions-script
  static get legacyType() {
    return 'condition.script';
  }

  constructor({ id, name = '', target = '', response = '', source = '', lang = 'painless' }) {
    super({ id, name, target, response });
    this.source = source;
    this.lang = lang;
  }

  get type() {
    return ConditionBlock.type;
  }

  // TODO: remove this when the docs fixed
  // https://docs.search-guard.com/latest/elasticsearch-alerting-conditions-script
  get legacyType() {
    return ConditionBlock.legacyType;
  }

  toFormik() {
    return {
      type: ConditionBlock.type,
      id: this.id,
      name: this.name,
      target: this.target,
      response: this.response,
      source: this.source,
      lang: this.lang,
    };
  }

  toWatchCheck() {
    const check = { type: ConditionBlock.type, source: this.source };

    if (this.name) check.name = this.name;
    if (this.target) check.target = this.target;
    if (this.lang) check.lang = this.lang;

    return check;
  }
}
