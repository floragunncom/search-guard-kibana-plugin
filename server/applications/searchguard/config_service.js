/*
 *    Copyright 2020 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { get as _get, set as _set, cloneDeep } from 'lodash';
import { readKibanaConfigFromFile } from './read_kibana_config';

function assertSearchguardPath(path) {
  if (path.split('.')[0] === 'searchguard') {
    throw new Error('The path must not start with "searchguard".');
  }
}

export class ConfigService {
  constructor(config = {}) {
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
