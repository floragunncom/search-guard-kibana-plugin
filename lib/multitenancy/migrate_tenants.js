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

import { IndexMigrator } from '../../../../src/legacy/server/saved_objects/migrations/core';

async function migrateTenants (server) {

    const backend = server.plugins.searchguard.getSearchGuardBackend();
    await server.plugins.elasticsearch.waitUntilReady();
    await server.kibanaMigrator.kbnServer.ready();
    server.log(['info', 'Search Guard migration'], "Starting tenant migration");
    try {
        let tenantInfo = await backend.getTenantInfo(backend.getServerUserAuthHeader());

        if (tenantInfo) {
             let indexNames = Object.keys(tenantInfo);
             for (var index = 0; index < indexNames.length; ++index) {
                 await runMigration(server, indexNames[index]);
             }
         }
    } catch (error) {
        server.log(['error', 'migration'], error);
        throw error;
    }
}

async function runMigration(server, tenantIndexName) {
    const  kibanaMigrator = server.kibanaMigrator;
    const config = server.config();

    const indexMigrator = new IndexMigrator({
        batchSize: config.get('migrations.batchSize'),
        callCluster: server.plugins.elasticsearch.getCluster('admin').callWithInternalUser,
        documentMigrator: kibanaMigrator.documentMigrator,
        index: tenantIndexName,
        log: kibanaMigrator.log,
        mappingProperties: kibanaMigrator.mappingProperties,
        pollInterval: config.get('migrations.pollInterval'),
        scrollDuration: config.get('migrations.scrollDuration'),
        serializer: kibanaMigrator.serializer,
    });

    return indexMigrator.migrate();
}

module.exports.migrateTenants=migrateTenants;
