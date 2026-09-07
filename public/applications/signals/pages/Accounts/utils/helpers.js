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
import { APP_PATH, ACCOUNT_ACTIONS } from '../../../utils/constants';

export const buildESQuery = (query) => {
  const must = get(query, 'bool.must', []);

  if (!!must.length) {
    const index = must.findIndex((clause) => clause.simple_query_string);

    if (index !== -1) {
      query.bool.must[index].simple_query_string.fields = ['_name', 'type'];
      if (query.bool.must[index].simple_query_string.query.slice(-1) !== '*') {
        query.bool.must[index].simple_query_string.query += '*';
        query.bool.must[index].simple_query_string.analyze_wildcard = true;
      }
    }
  }

  return query;
};

export const buildTenantAccounts = (accounts = []) => {
  const globalAccountKeys = new Set(
    accounts
      .filter(({ _tenant: tenant }) => !tenant)
      .map(({ _id, type }) => `${type.toLowerCase()}/${_id}`)
  );

  return accounts
    .filter(({ _tenant: tenant }) => !!tenant)
    .map((account) => ({
      ...account,
      _shadowsGlobal: globalAccountKeys.has(`${account.type.toLowerCase()}/${account._id}`),
    }));
};

export const getResourceEditUri = (id, type, tenantScoped = false) =>
  `${APP_PATH.DEFINE_ACCOUNT}?id=${encodeURIComponent(id)}&accountType=${type}${
    tenantScoped ? '&scope=tenant' : ''
  }`;

export const getResourceReadUri = (id, type, tenantScoped = false) => {
  return `${APP_PATH.DEFINE_JSON_ACCOUNT}?id=${encodeURIComponent(id)}&accountType=${type}&action=${
    ACCOUNT_ACTIONS.READ_ACCOUNT
  }${tenantScoped ? '&scope=tenant' : ''}`;
};
