/*
 *    Copyright 2021 floragunn GmbH
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
import { isAuthorized } from '../../../utils';

function whitelistMap(kibanaVersionIndex) {
  return {
    [`POST/${kibanaVersionIndex}/_search{"size":100,"seq_no_primary_term":true,"from":0,"query":{"bool":{"filter":[{"bool":{"should":[{"match":{"ingest-package-policies.package.name":"endpoint"}}],"minimum_should_match":1}},{"bool":{"should":[{"bool":{"must":[{"term":{"type":"ingest-package-policies"}}],"must_not":[{"exists":{"field":"namespace"}},{"exists":{"field":"namespaces"}}]}}],"minimum_should_match":1}}]}},"sort":[{"ingest-package-policies.updated_at":{"order":"desc","unmapped_type":"date"}}]}`]: true,
  };
}

function shouldBeAuthorized(result, kibanaVersionIndex) {
  const { method, path, body } = get(result, 'meta.request.params', {});
  let rule = method + path;
  if (body) rule += body;

  return whitelistMap(kibanaVersionIndex)[rule] || false;
}

export function rootScopedClientRequestWrapper({ configService, kibanaVersionIndex }) {
  return (error, result) => {
    if (!isAuthorized(result) && shouldBeAuthorized(result, kibanaVersionIndex)) {
      // Authorize as Kibana system user
      const { username, password } = configService.get('elasticsearch', {});

      result.meta.request.params.headers.authorization = `Basic ${Buffer.from(
        `${username}:${password}`
      ).toString('base64')}`;
    }
  };
}
