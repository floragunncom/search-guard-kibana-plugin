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

import { assign, cloneDeep, set } from 'lodash';
import { UiConfigService } from '../../../../services/UiConfigService';
import { PAGE_NAMES, PAGE_CONFIGS } from '../utils/constants';

export class ConfigService extends UiConfigService {
  constructor({ config = {}, uiSettings, coreContext, apiService } = {}) {
    super({ config, uiSettings, coreContext, apiService });
  }

  async fetchConfig() {
    try {
      await super.fetchConfig();
      set(this.config, 'searchguard.configuration', this.buildSeardGuardConfig(this.config));
    } catch (error) {
      console.error('ConfigService, this.fetchConfig', error);
      throw error;
    }
  }

  buildSeardGuardConfig({ restapiinfo, searchguard }) {
    const isEndpointAndMethodEnabled = function (endpoint, method) {
      if (restapiinfo && restapiinfo.disabled_endpoints) {
        if (restapiinfo.disabled_endpoints[endpoint]) {
          return restapiinfo.disabled_endpoints[endpoint].indexOf(method) === -1;
        } else {
          return true;
        }
      }

      return false;
    };

    const sgConfig = cloneDeep(searchguard.configuration);
    const pagesConfig = Object.keys(PAGE_NAMES).reduce((pagesConfig, pageName) => {
      pagesConfig[pageName] = {
        enabled:
          sgConfig[pageName].enabled &&
          isEndpointAndMethodEnabled(
            PAGE_CONFIGS[pageName].api.endpoint,
            PAGE_CONFIGS[pageName].api.method
          ),
      };

      return pagesConfig;
    }, {});

    assign(sgConfig, pagesConfig);
    return sgConfig;
  }
}
