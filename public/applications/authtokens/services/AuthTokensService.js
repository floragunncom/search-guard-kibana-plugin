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

import { get } from 'lodash';
export const API_ROOT = '../api/v1/security_authtokens';

export class AuthTokensService {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  list = (dslQuery = { scroll: '30s', sort: [{ created_at: { order: 'desc' } }] }) =>
    this.httpClient.post(`${API_ROOT}/authtoken/_search`, dslQuery).then(({ data } = {}) => data);

  delete = (id) => {
    return this.httpClient
      .delete(`${API_ROOT}/authtoken/${encodeURIComponent(id)}`)
      .then(({ data }) => data);
  };

  save = (authToken) =>
    this.httpClient.post(`${API_ROOT}/authtoken`, authToken).then(({ data } = {}) => data);

  get = (id) =>
    this.httpClient
      .get(`${API_ROOT}/authtoken/${encodeURIComponent(id)}`)
      .then(({ data } = {}) => data);

  isServiceEnabled = () =>
    this.httpClient
      .get(`${API_ROOT}/authtoken/_info`)
      .then(({ data } = {}) => data !== null && typeof data === 'object' && data.enabled === true);

  hasUserPermissionsToAccessTheApp = () =>
    this.list({ size: 0, query: { match_all: {} } })
      .then(() => true)
      .catch((error) => (get(error, 'body.statusCode') === 403 ? false : true));
}
