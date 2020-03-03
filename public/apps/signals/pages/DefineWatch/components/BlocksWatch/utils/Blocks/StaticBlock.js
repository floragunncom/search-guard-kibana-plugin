import { Block } from './Block';
import { stringifyPretty } from '../../../../../../utils/helpers';

export class StaticBlock extends Block {
  static get type() {
    return 'static';
  }

  constructor({ id, name = '', target = '', response = '', value = {} }) {
    super({ id, name, target, value, response });
    this.value = value;
  }

  get type() {
    return StaticBlock.type;
  }

  toFormik() {
    const formik = {
      type: StaticBlock.type,
      id: this.id,
      name: this.name,
      target: this.target,
      response: this.response,
    };

    let value = '';
    try {
      value = stringifyPretty(this.value);
    } catch (error) {
      // We expect we get valid JSON from the ES plugin API and we never have this error.
      console.log(`StaticBlock - Fail to stringify block value`, error);
    }

    formik.value = value;

    return formik;
  }

  toWatchCheck() {
    const check = { type: StaticBlock.type };

    if (this.name) check.name = this.name;
    if (this.target) check.target = this.target;

    let value = {};
    try {
      value = JSON.parse(this.value);
    } catch (error) {
      // We expect we get valid JSON string after the Formik form validated and we never have this error.
      console.log(`StaticBlock - Fail to parse JSON string block value`, error);
    }

    check.value = value;

    return check;
  }
}
