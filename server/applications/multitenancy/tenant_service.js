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

export class TenantService {
  constructor({ kibanaVersion, clusterClient, logger, configService }) {
    this.kibanaVersion = kibanaVersion;
    this.clusterClient = clusterClient;
    this.logger = logger;
    this.configService = configService;

    /*
      The SG backend maps calls for the alias .kibana and the version alias .kibana_<V> to the selectedTenant aliases.
      For example:
        .kibana -> .kibana_-<N>_tenant
        .kibana_V -> .kibana_-<N>_tenant_<V>
    */
    this.aliasName = this.configService.get('kibana.index');
    this.versionAliasName = this.aliasName + `_${this.kibanaVersion}`;
    this.versionIndexName = this.versionAliasName + '_001';
  }

  logErrorDetails = (error, message) => {
    if (!message) message = error.message;

    let errorMeta = JSON.stringify(get(error, 'meta.body', ''));
    if (!errorMeta || !errorMeta.length) errorMeta = error;

    this.logger.error(`${message}, ${errorMeta}`);
  };

  indexExists = async ({ request, indexName }) => {
    try {
      await this.clusterClient.asScoped(request).asCurrentUser.transport.request({
        method: 'get',
        path: `/${indexName}`,
      });

      return true;
    } catch (error) {
      if (error.meta.statusCode === 404) {
        return false;
      } else {
        this.logErrorDetails(error, `Fail to verify index "${indexName}"`);
      }
    }

    return false;
  };

  docExists = async ({ request, indexName, docId }) => {
    try {
      await this.clusterClient.asScoped(request).asCurrentUser.transport.request({
        method: 'get',
        path: `/${indexName}/_doc/${docId}`,
      });

      return true;
    } catch (error) {
      if (error.meta.statusCode === 404) {
        return false;
      } else {
        this.logErrorDetails(error, `Fail to verify doc "${docId}"`);
      }
    }

    return false;
  };

  createIndexAlias = async ({ request, aliasName, indices }) => {
    try {
      return await this.clusterClient.asScoped(request).asCurrentUser.indices.putAlias({
        index: indices,
        name: aliasName,
      });
    } catch (error) {
      this.logErrorDetails(error, `Fail to create alias "${aliasName}" for indices "${indices}"`);
    }
  };

  createDoc = async ({
    request,
    tenantName,
    versionIndexName,
    docId,
    docBody,
    refresh = true,
  } = {}) => {
    try {
      // Create doc and index
      await this.clusterClient.asScoped(request).asCurrentUser.create({
        id: docId,
        body: docBody,
        index: versionIndexName,
        refresh,
      });
    } catch (error) {
      const docExists = get(error, 'meta.statusCode') === 409;

      if (!docExists) {
        this.logErrorDetails(
          error,
          `Fail to create the doc "${docId}" for tenant "${tenantName}" in index ${versionIndexName}`
        );
      }
    }
  };

  createIndexAndAliases = async ({
    request,
    tenantName,
    aliasName,
    versionAliasName,
    versionIndexName,
  } = {}) => {
    try {
      await this.clusterClient.asScoped(request).asCurrentUser.indices.create({
        index: versionIndexName,
      });

      // We must create an alias and a version alias. The migration algorithm requires the alias.
      // And the Kibana page is broken after a tenant is selected if there is no version alias because apps query the version alias directly.
      const aliasesToCreate = [aliasName, versionAliasName];
      return Promise.all(
        aliasesToCreate.map((aliasName) =>
          this.createIndexAlias({ request, aliasName, indices: [versionIndexName] })
        )
      );
    } catch (error) {
      const indexExists =
        get(error, 'meta.statusCode') === 400 &&
        get(error, 'meta.body.error.type') === 'resource_already_exists_exception';

      if (!indexExists) {
        this.logErrorDetails(
          error,
          `Fail to create the index "${versionIndexName}" for tenant "${tenantName}"`
        );
      }
    }
  };

  createIndexForTenant = async ({ request, selectedTenant = '' } = {}) => {
    const indexExists = await this.indexExists({ request, indexName: this.aliasName });

    if (!indexExists) {
      return this.createIndexAndAliases({
        request,
        aliasName: this.aliasName,
        versionAliasName: this.versionAliasName,
        versionIndexName: this.versionIndexName,
        tenantName: selectedTenant,
      });
    }
  };
}
