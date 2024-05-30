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
/**
 * The SearchGuard  backend.
 */
export default class SearchGuardConfigurationBackend {
  constructor({ elasticsearch }) {
    this.elasticsearch = elasticsearch;
  }

  _client = async ({ headers = {}, asWho = 'asCurrentUser', ...options }) => {
    const { body } = await this.elasticsearch.client
      .asScoped({ headers })
      [asWho].transport.request(options);

    return body;
  };

  restapiinfo = async (headers) => {
    try {
      return await this._client({
        path: '/_searchguard/api/permissionsinfo',
        method: 'get',
        headers: headers,
      });
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      throw error;
    }
  };

  indices = async ({ headers, index = [] } = {}) => {
    try {
      const { body: response } = await this.elasticsearch.client
        .asScoped({ headers })
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
  };

  aliases = async ({ headers, alias = [] } = {}) => {
    try {
      const { body: response } = await this.elasticsearch.client
        .asScoped({ headers })
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
  };

  dataStreams = async ({ headers, index = [] } = {}) => {
    try {
      const { body: response } = await this.elasticsearch.client
        .asScoped({ headers })
        .asCurrentUser.indices.getDataStream({
          name: '*',
          format: 'json'
        });

      return response;
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      throw error;
    }
  };

  list = async (headers, resourceName) => {
    try {
      return await this._client({
        path: `/_searchguard/api/${resourceName}`,
        method: 'get',
        headers,
      });
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      throw error;
    }
  };

  get = async (headers, resourceName, id) => {
    try {
      const response = await this._client({
        path: `/_searchguard/api/${resourceName}/${encodeURIComponent(id)}`,
        method: 'get',
        headers,
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
  };

  save = async (headers, resourceName, id, body) => {
    try {
      return await this._client({
        path: `/_searchguard/api/${resourceName}/${encodeURIComponent(id)}`,
        method: 'put',
        headers,
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
  };

  delete = async (headers, resourceName, id) => {
    try {
      return await this._client({
        path: `/_searchguard/api/${resourceName}/${encodeURIComponent(id)}`,
        method: 'delete',
        headers,
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
  };

  clearCache = async (headers) => {
    try {
      return await this._client({
        path: '/_searchguard/api/cache',
        method: 'delete',
        headers,
      });
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      throw error;
    }
  };

  validateDls = async (headers, indexname, body) => {
    try {
      return await this._client({
        path: '/_validate/query?explain=true',
        method: 'post',
        headers,
        body,
      });
    } catch (error) {
      if (error.statusCode === 401) {
        throw new AuthenticationError(error.message, error);
      }
      throw error;
    }
  };

  getIndexMappings = async ({ headers, body: { index } }) => {
    try {
      const { body: mappings } = await this.elasticsearch.client
        .asScoped({ headers })
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
