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

import SignalsService from './SignalsService';
import { ROUTE_PATH } from '../utils/constants';

export default class WatchService extends SignalsService {
  execute({ watch, simulate = false, skipActions = true } = {}) {
    return this.httpClient
      .post(`..${ROUTE_PATH.WATCH_EXECUTE}`, {
        watch,
        simulate,
        skipActions,
      })
      .then(({ data }) => data);
  }

  executeESRequest(request) {
    return super.post(`..${ROUTE_PATH.WATCH_EXECUTE_GRAPH}`, { request });
  }

  put(watch, id) {
    return super.put(`..${ROUTE_PATH.WATCH}/${encodeURIComponent(id)}`, watch);
  }

  get(id) {
    return super.get(`..${ROUTE_PATH.WATCH}/${encodeURIComponent(id)}`);
  }

  search(query = {}) {
    return super.post(`..${ROUTE_PATH.WATCHES}`, { query });
  }

  delete(id) {
    return super.delete(`..${ROUTE_PATH.WATCH}/${encodeURIComponent(id)}`);
  }

  ack(watchId, actionId) {
    let url = `..${ROUTE_PATH.WATCH}/${encodeURIComponent(watchId)}/_ack`;
    if (actionId) {
      url += `/${actionId}`;
    }

    return super.put(url);
  }

  state(id) {
    return super.get(`..${ROUTE_PATH.WATCH}/${encodeURIComponent(id)}/_state`);
  }
}
