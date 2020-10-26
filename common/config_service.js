/* eslint-disable @kbn/eslint/require-license-header */
/* eslint-disable no-restricted-imports */
import { get as _get, set as _set, cloneDeep } from 'lodash';

function assertSearchguardPath(path) {
  if (path.split('.')[0] === 'searchguard') {
    throw new Error('The path must not start with "searchguard".');
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

  getSearchguardConfig(path = '', defaultValue) {
    assertSearchguardPath(path);
    path = path ? `searchguard.${path}` : 'searchguard';
    return this.get(path, defaultValue);
  }

  set(path, value) {
    _set(this.config, path, value);
  }

  setSearchguardConfig(path, value) {
    assertSearchguardPath(path);
    this.set(`searchguard.${path}`, value);
  }
}
