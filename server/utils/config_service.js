/* eslint-disable @kbn/eslint/require-license-header */
import { get as getOnPath, cloneDeep } from 'lodash';

export class ConfigService {
  constructor(config) {
    this.config = config;
  }

  get(path, defaulValue) {
    return getOnPath(this.getConfig(), path, defaulValue);
  }

  getConfig() {
    return cloneDeep(this.config);
  }
}
