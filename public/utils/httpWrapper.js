/* eslint-disable @osd/eslint/require-license-header */
/**
 * Copyright 2023 Excelerate Technology Limited T/A Eliatra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * *    Copyright 2020 floragunn GmbH

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * This is a temporary compability wrapper between angular's $http and NP's fetch.
 * @todo If we stick with this as a wrapper, we need to take
 * care of error handling
 */
export class HttpWrapper {
  constructor(coreHttp) {
    this.http = coreHttp;
  }

  setCoreHttp(coreHttp) {
    this.http = coreHttp;
    return this;
  }

  getBasePath() {
    return this.http.basePath.get();
  }

  /**
   * Getter to the original coreSetup.http.
   * Should help avoiding syntax errors in consumers
   * should we decide to remove the httpWrapper
   * @returns {*}
   */
  get basePath() {
    return this.http.basePath;
  }

  get(url, options) {
    return this.http.get(url, options).then(response => {
      return {
        data: response,
      };
    });
  }

  delete(url) {
    return this.http.delete(url).then(response => {
      return {
        data: response,
      };
    });
  }

  post(url, data = null, options = {}) {
    if (options.body && typeof options.body !== 'string') {
      options.body = JSON.stringify(options.body);
    }

    if (data) {
      options.body = JSON.stringify(data);
    }

    return this.http.post(url, options).then(response => {
      return {
        data: response,
      };
    });
  }

  put(url, data = null, options = {}) {
    if (options.body && typeof options.body !== 'string') {
      options.body = JSON.stringify(options.body);
    }

    if (data) {
      options.body = JSON.stringify(data);
    }

    return this.http.put(url, options).then(response => {
      return {
        data: response,
      };
    });
  }
}
