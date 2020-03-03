export class Block {
  static get type() {
    return 'block';
  }

  constructor({ id, name = '', target = '', response = '' }) {
    this.id = id;
    this.name = name;
    this.target = target;
    this.response = response;
  }

  get type() {
    return Block.type;
  }

  toFormik() {
    throw new Error('Block - The method must be declared in a child.');
  }

  toWatchCheck() {
    throw new Error('Block - The method must be declared in a child.');
  }
}
