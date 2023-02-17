/* eslint-disable @osd/eslint/require-license-header */
/* eslint-disable no-restricted-imports */
import { get as _get, set as _set, cloneDeep } from 'lodash';

function assertEliatrasuitePath(path) {
  if (path.split('.')[0] === 'eliatra') {
    throw new Error('The path must not start with "eliatra".');
  }
}

export class ConfigService {
  constructor(config) {
    this.config = config;
  }

  get(path, defaultValue) {
    return _get(this.getConfig(), path, defaultValue);
  }

  getConfig() {
    return cloneDeep(this.config);
  }

  getEliatrasuiteConfig(path = '', defaultValue) {
    assertEliatrasuitePath(path);
    path = path ? `eliatra.security.${path}` : 'eliatra';
    return this.get(path, defaultValue);
  }

  set(path, value) {
    _set(this.config, path, value);
  }

  setEliatrasuiteConfig(path, value) {
    assertEliatrasuitePath(path);
    this.set(`eliatra.security.${path}`, value);
  }
}
