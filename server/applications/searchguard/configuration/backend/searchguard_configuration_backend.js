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

import { AuthenticationError } from '../../auth/errors';
import NotFoundError from './../../backend/errors/not_found';
import filterAuthHeaders from '../../auth/filter_auth_headers';
/**
 * The SearchGuard  backend.
 */
export default class SearchGuardConfigurationBackend {
  constructor({ configService, getElasticsearch }) {
    this.getElasticsearch = getElasticsearch;
    this.configService = configService;
    this.requestHeadersWhitelist = this.configService.get('elasticsearch.requestHeadersWhitelist');
  }

  async _client({ headers = {}, asWho = 'asCurrentUser', ...options }) {
    const elasticsearch = await this.getElasticsearch();
    const { body } = await elasticsearch.client
      .asScoped({ headers })
      [asWho].transport.request(options);

    return body;
  }

  async restapiinfo(headers) {
    try {
      const authHeaders = filterAuthHeaders(headers, this.requestHeadersWhitelist);
      return await this._client({
        path: '/_searchguard/api/permissionsinfo',
        method: 'get',
        headers: authHeaders,
      });
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      throw error;
    }
  }

  async indices({ headers, index = [] } = {}) {
    try {
      const authHeaders = filterAuthHeaders(headers, this.requestHeadersWhitelist);
      const elasticsearch = await this.getElasticsearch();
      const { body: response } = await elasticsearch.client
        .asScoped({ headers: authHeaders })
        .asCurrentUser.cat.indices({
          index,
          format: 'json',
          h: 'index,health',
        });

      return response;
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      throw error;
    }
  }

  async aliases({ headers, alias = [] } = {}) {
    try {
      const authHeaders = filterAuthHeaders(headers, this.requestHeadersWhitelist);
      const elasticsearch = await this.getElasticsearch();
      const { body: response } = await elasticsearch.client
        .asScoped({ headers: authHeaders })
        .asCurrentUser.cat.aliases({
          alias,
          format: 'json',
          h: 'index,alias',
        });

      return response;
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      throw error;
    }
  }

  async list(headers, resourceName) {
    try {
      const authHeaders = filterAuthHeaders(headers, this.requestHeadersWhitelist);
      return await this._client({
        path: `/_searchguard/api/${resourceName}`,
        method: 'get',
        headers: authHeaders,
      });
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      throw error;
    }
  }

  async get(headers, resourceName, id) {
    try {
      const authHeaders = filterAuthHeaders(headers, this.requestHeadersWhitelist);
      const response = await this._client({
        path: `/_searchguard/api/${resourceName}/${id}`,
        method: 'get',
        headers: authHeaders,
      });

      return response[id];
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      if (error.statusCode === 404) {
        throw new NotFoundError(error.message, error);
      }
      throw error;
    }
  }

  async save(headers, resourceName, id, body) {
    try {
      const authHeaders = filterAuthHeaders(headers, this.requestHeadersWhitelist);
      return await this._client({
        path: `/_searchguard/api/${resourceName}/${id}`,
        method: 'put',
        headers: authHeaders,
        body,
      });
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      if (error.statusCode === 404) {
        throw new NotFoundError(error.message, error);
      }
      throw error;
    }
  }

  async delete(headers, resourceName, id) {
    try {
      const authHeaders = filterAuthHeaders(headers, this.requestHeadersWhitelist);
      return await this._client({
        path: `/_searchguard/api/${resourceName}/${id}`,
        method: 'delete',
        headers: authHeaders,
      });
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      if (error.statusCode === 404) {
        throw new NotFoundError(error.message, error);
      }
      throw error;
    }
  }

  async clearCache(headers) {
    try {
      const authHeaders = filterAuthHeaders(headers, this.requestHeadersWhitelist);
      return await this._client({
        path: '/_searchguard/api/cache',
        method: 'delete',
        headers: authHeaders,
      });
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      throw error;
    }
  }

  async validateDls(headers, indexname, body) {
    try {
      const authHeaders = filterAuthHeaders(headers, this.requestHeadersWhitelist);
      return await this._client({
        path: '/_validate/query?explain=true',
        method: 'post',
        headers: authHeaders,
        body,
      });
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      throw error;
    }
  }

  getIndexMappings = async ({ headers, body: { index } }) => {
    try {
      const authHeaders = filterAuthHeaders(headers, this.requestHeadersWhitelist);
      const elasticsearch = await this.getElasticsearch();
      const { body: mappings } = await elasticsearch.client
        .asScoped({ headers: authHeaders })
        .asCurrentUser.indices.getMapping({
          index: index.join(','),
          ignore_unavailable: true,
          allow_no_indices: true,
        });

      return { total: Object.keys(mappings).length, mappings };
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      throw error;
    }
  };
}
