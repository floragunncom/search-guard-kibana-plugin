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

export const DEFAULT_SPACE_NAME = 'default';

// ATTENTION! If either Saved Objects migration or integration with spaces doesn't work,
// check the space document structure in your Kibana version. Maybe it changed.
export function getDefaultSpaceDoc(kibanaVersion) {
  return {
    space: {
      name: 'Default',
      description: 'This is your default space!',
      disabledFeatures: [],
      color: '#00bfb3',
      _reserved: true,
    },
    type: 'space',
    references: [],
    migrationVersion: {
      space: '6.6.0',
    },
    coreMigrationVersion: kibanaVersion,
    updated_at: new Date().toISOString(),
  };
}

export class SpacesService {
  constructor({ kibanaVersion, clusterClient, logger, configService, searchGuardBackend }) {
    this.kibanaVersion = kibanaVersion;
    this.clusterClient = clusterClient;
    this.logger = logger;
    this.configService = configService;
    this.searchGuardBackend = searchGuardBackend;
  }

  logErrorDetails = (error, message) => {
    if (!message) message = error.message;

    let errorMeta = JSON.stringify(get(error, 'meta.body', ''), null, 2);
    if (!errorMeta || !errorMeta.length) errorMeta = error;

    this.logger.error(`${message}, ${errorMeta}`);
  };

  spaceExists = async ({ request, indexName, spaceName }) => {
    try {
      await this.clusterClient.asScoped(request).asCurrentUser.transport.request({
        method: 'get',
        path: `/${indexName}/_doc/space:${spaceName}`,
      });

      return true;
    } catch (error) {
      if (error.meta.statusCode === 404) {
        return false;
      } else {
        this.logErrorDetails(error, `Fail to verify space "${spaceName}"`);
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

  createSpaceForTenant = async ({
    request,
    tenantName,
    aliasName,
    versionAliasName,
    versionIndexName,
    spaceName,
    spaceBody,
    refresh = true,
  } = {}) => {
    try {
      // Create doc and index
      await this.clusterClient.asScoped(request).asCurrentUser.create({
        id: `space:${spaceName}`,
        index: versionIndexName,
        body: spaceBody,
        refresh,
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
      const spaceExists = get(error, 'meta.statusCode') === 409;
      if (!spaceExists) {
        this.logErrorDetails(
          error,
          `Fail to create the space "${spaceName}" for tenant "${tenantName}" in index ${versionIndexName}`
        );
      }
    }
  };

  createDefaultSpace = async ({ request, selectedTenant = '' } = {}) => {
    /*
      The SG backend maps calls for the alias .kibana and the version alias .kibana_<V> to the selectedTenant aliases.
      For example:
        .kibana -> .kibana_-<N>_tenant
        .kibana_V -> .kibana_-<N>_tenant_<V>
    */
    const aliasName = this.configService.get('kibana.index');
    const versionAliasName = aliasName + `_${this.kibanaVersion}`;
    const versionIndexName = versionAliasName + '_001';

    const spaceExists = await this.spaceExists({
      request,
      index: aliasName,
      spaceName: DEFAULT_SPACE_NAME,
    });

    if (!spaceExists) {
      return this.createSpaceForTenant({
        request,
        aliasName,
        versionAliasName,
        versionIndexName,
        tenantName: selectedTenant,
        spaceName: DEFAULT_SPACE_NAME,
        spaceBody: getDefaultSpaceDoc(this.kibanaVersion),
      });
    }
  };
}
