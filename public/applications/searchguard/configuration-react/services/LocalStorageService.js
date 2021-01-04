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

import { LOCAL_STORAGE_NAME } from '../utils/constants';

export default class LocalStorageService {
  get cache() {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_NAME), '{}');
  }

  set cache(cache = {}) {
    localStorage.setItem(LOCAL_STORAGE_NAME, JSON.stringify(cache));
  }

  setCacheByPath(appPath, cache = {}) {
    localStorage.setItem(
      LOCAL_STORAGE_NAME,
      JSON.stringify({
        ...this.cache,
        [appPath]: { ...this.cache[appPath], ...cache },
      })
    );
  }
}
