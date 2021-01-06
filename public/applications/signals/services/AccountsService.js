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

export default class AccountsService extends SignalsService {
  constructor(httpClient, type) {
    super(httpClient);
    this.type = type;
  }

  put(account, id, type = this.type) {
    return super.put(`..${ROUTE_PATH.ACCOUNT}/${type}/${encodeURIComponent(id)}`, account);
  }

  get(id, type = this.type) {
    return super.get(`..${ROUTE_PATH.ACCOUNT}/${type}/${encodeURIComponent(id)}`);
  }

  search(query = {}) {
    return super.post(`..${ROUTE_PATH.ACCOUNTS}`, { query });
  }

  delete(id, type = this.type) {
    return super.delete(`..${ROUTE_PATH.ACCOUNT}/${type}/${encodeURIComponent(id)}`);
  }
}
