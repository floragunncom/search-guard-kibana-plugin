import { defaultsDeep } from 'lodash';
import { Block } from './Block';
import {
  stringifyPretty,
  arrayToComboBoxOptions,
  comboBoxOptionsToArray,
} from '../../../../../../utils/helpers';

export const REQUEST_DEFAULTS = {
  indices: [],
  body: {},
};

export class SearchBlock extends Block {
  static get type() {
    return 'search';
  }

  constructor({ id, name = '', target = '', response = '', request = {} }) {
    super({ id, name, target, response });
    this.request = defaultsDeep(request, REQUEST_DEFAULTS);
  }

  get type() {
    return SearchBlock.type;
  }

  toFormik() {
    const formik = {
      type: SearchBlock.type,
      id: this.id,
      name: this.name,
      target: this.target,
      response: this.response,
    };

    const request = defaultsDeep({}, this.request);
    request.indices = arrayToComboBoxOptions(request.indices);

    try {
      request.body = stringifyPretty(request.body);
    } catch (error) {
      request.body = {};
      console.log('SearchBlock - Fail to stringify request.body', error);
    }

    formik.request = request;

    return formik;
  }

  toWatchCheck() {
    const check = { type: SearchBlock.type };

    if (this.name) check.name = this.name;
    if (this.target) check.target = this.target;

    const { indices = [], body = {} } = this.request;
    const request = {
      indices: comboBoxOptionsToArray(indices),
      body: {},
    };

    try {
      request.body = JSON.parse(body);
    } catch (error) {
      // We expect we get valid JSON string after the Formik form validated and we never have this error.
      console.log(`SearchBlock - Fail to parse JSON string block value`, error);
    }

    check.request = request;

    return check;
  }
}
