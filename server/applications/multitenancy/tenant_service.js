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
  constructor({ clusterClient, logger, configService, savedObjects, coreContext}) {
    this.kibanaVersion = coreContext.env.packageInfo.version;
    this.clusterClient = clusterClient;
    this.logger = logger;
    this.configService = configService;

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
        index: this.aliasName,
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
}
