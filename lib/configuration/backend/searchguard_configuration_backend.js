/* eslint-disable @kbn/eslint/require-license-header */
/**
 *    Copyright 2016 floragunn GmbH

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

import SearchGuardConfigurationPlugin from './searchguard_configuration_plugin';
import wrapElasticsearchError from './../../backend/errors/wrap_elasticsearch_error';
import NotFoundError from './../../backend/errors/not_found';
import filterAuthHeaders from '../../auth/filter_auth_headers';
/**
 * The SearchGuard  backend.
 */
export default class SearchGuardConfigurationBackend {
  constructor({ core, configService }) {
    this._cluster = core.elasticsearch.legacy.createClient('searchguard', {
      plugins: [SearchGuardConfigurationPlugin],
      auth: true,
    });

    this.configService = configService;
    this.requestHeadersWhitelist = this.configService.get('elasticsearch.requestHeadersWhitelist');
  }

  /**
   * "Simulate" the old _noAuthClient behaviour by calling the client with an empty request,
   * i.e. with no request headers
   * @param endPoint
   * @param clientParams
   * @param options
   * @returns {Promise<{(params: BulkIndexDocumentsParams, callback: (error: any, response: any) => void): void; (params: BulkIndexDocumentsParams): Promise<any>}>}
   * @private
   */
  async _client(endPoint, clientParams, options) {
    const request = {};
    // Kibana will overwrite the clientParams.headers if we don't add them like this
    if (clientParams.headers) {
      request.headers = clientParams.headers;
    }

    return await this._cluster.asScoped(request).callAsCurrentUser(endPoint, clientParams, options);
  }

  async restapiinfo(headers) {
    try {
      const authHeaders = filterAuthHeaders(headers, this.requestHeadersWhitelist);
      const response = await this._client('searchguard.restapiinfo', {
        headers: authHeaders,
      });
      return response;
    } catch (error) {
      throw wrapElasticsearchError(error);
    }
  }

  async indices({ headers, index = [] } = {}) {
    try {
      const authHeaders = filterAuthHeaders(headers, this.requestHeadersWhitelist);
      const options = { format: 'json', h: 'index,health', index, headers: authHeaders };

      return await this._client('cat.indices', options);
    } catch (error) {
      throw wrapElasticsearchError(error);
    }
  }

  async aliases({ headers, alias = [] } = {}) {
    try {
      const authHeaders = filterAuthHeaders(headers, this.requestHeadersWhitelist);
      const options = { format: 'json', h: 'index,alias', alias, headers: authHeaders };

      return await this._client('cat.aliases', options);
    } catch (error) {
      throw wrapElasticsearchError(error);
    }
  }

  async list(headers, resourceName) {
    const authHeaders = filterAuthHeaders(headers, this.requestHeadersWhitelist);
    try {
      const response = await this._client('searchguard.listResource', {
        resourceName: resourceName,
        headers: authHeaders,
      });
      return response;
    } catch (error) {
      throw wrapElasticsearchError(error);
    }
  }

  async get(headers, resourceName, id) {
    const authHeaders = filterAuthHeaders(headers, this.requestHeadersWhitelist);
    try {
      const response = await this._client('searchguard.getResource', {
        resourceName: resourceName,
        id,
        headers: authHeaders,
      });

      return response[id];
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundError();
      }
      throw wrapElasticsearchError(error);
    }
  }

  async save(headers, resourceName, id, body) {
    const authHeaders = filterAuthHeaders(headers, this.requestHeadersWhitelist);
    try {
      const response = await this._client('searchguard.saveResource', {
        resourceName: resourceName,
        id,
        body: body,
        headers: authHeaders,
      });
      return response;
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundError();
      }
      throw wrapElasticsearchError(error);
    }
  }

  async delete(headers, resourceName, id) {
    const authHeaders = filterAuthHeaders(headers, this.requestHeadersWhitelist);
    try {
      return await this._client('searchguard.deleteResource', {
        resourceName: resourceName,
        id,
        headers: authHeaders,
      });
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundError();
      }
      throw wrapElasticsearchError(error);
    }
  }

  async clearCache(headers) {
    const authHeaders = filterAuthHeaders(headers, this.requestHeadersWhitelist);
    try {
      const response = await this._client('searchguard.clearCache', {
        headers: authHeaders,
      });
      return response;
    } catch (error) {
      throw wrapElasticsearchError(error);
    }
  }

  async validateDls(headers, indexname, body) {
    const authHeaders = filterAuthHeaders(headers, this.requestHeadersWhitelist);
    try {
      const response = await this._client('searchguard.validateDls', {
        body: body,
        headers: authHeaders,
      });
      return response;
    } catch (error) {
      throw wrapElasticsearchError(error);
    }
  }

  getIndexMappings = async ({ headers, body: { index } }) => {
    try {
      const authHeaders = filterAuthHeaders(headers, this.requestHeadersWhitelist);
      const mappings = await this._client('searchguard.getIndexMappings', {
        headers: authHeaders,
        index: index.join(','),
        ignore_unavailable: true,
        allow_no_indices: true,
      });
      return { total: Object.keys(mappings).length, mappings };
    } catch (error) {
      throw wrapElasticsearchError(error);
    }
  };
}
