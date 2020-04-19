/* eslint-disable @kbn/eslint/require-license-header */
/**
 *    Copyright 2018 floragunn GmbH

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

import IndexMigrator from './index_migrator';

async function migrateTenants(searchGuardBackend, server) {
  const backend = searchGuardBackend;
  await server.plugins.elasticsearch.waitUntilReady();

  server.log(['info', 'Search Guard migration'], 'Starting tenant migration');
  try {
    const tenantInfo = await backend.getTenantInfoWithInternalUser();

    if (tenantInfo) {
      const indexNames = Object.keys(tenantInfo);
      for (let index = 0; index < indexNames.length; ++index) {
        await runMigration(server, indexNames[index]);
      }
    }
  } catch (error) {
    server.log(['error', 'migration'], error);
    throw error;
  }
}

async function runMigration(server, tenantIndexName) {
  const kibanaMigrator = server.kibanaMigrator;

  const savedObjectsConfig = server.kibanaMigrator.savedObjectsConfig;
  const indexMigrator = new IndexMigrator({
    batchSize: savedObjectsConfig.batchSize,
    pollInterval: savedObjectsConfig.pollInterval,
    scrollDuration: savedObjectsConfig.scrollDuration,
    callCluster: server.plugins.elasticsearch.getCluster('admin').callWithInternalUser,
    documentMigrator: kibanaMigrator.documentMigrator,
    index: tenantIndexName,
    log: kibanaMigrator.log,
    mappingProperties: kibanaMigrator.mappingProperties,
    serializer: kibanaMigrator.serializer,
  });

  return indexMigrator.migrate();
}

module.exports.migrateTenants = migrateTenants;
