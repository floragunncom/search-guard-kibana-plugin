/* eslint-disable @kbn/eslint/require-license-header */
/**
 *    Copyright 2020 floragunn GmbH

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

import { migrationRetryCallCluster } from '../../../../../src/core/server/elasticsearch/client';
import { createMigrationEsClient } from '../../../../../src/core/server/saved_objects/migrations/core';
import { KibanaMigrator } from '../../../../../src/core/server/saved_objects/migrations';

import { defineMigrateRoutes } from './routes';

export class TenantsMigrationService {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.logger = coreContext.logger.get('tenants-migration-service');
  }

  async start({ savedObjects, searchGuardBackend, esClient, kibanaRouter, configService }) {
    this.logger.debug('Start tenants saved objects migration');

    try {
      const savedObjectsConfig = configService.get('searchguard.saved_objects');
      const savedObjectsMigrationConfig = configService.get(
        'searchguard.multitenancy.saved_objects_migration'
      );

      const config = {
        maxImportPayloadBytes: savedObjectsConfig.max_import_payload_bytes,
        maxImportExportSize: savedObjectsConfig.max_import_export_size,
        migration: {
          batchSize: savedObjectsMigrationConfig.batch_size,
          scrollDuration: savedObjectsMigrationConfig.scroll_duration,
          pollInterval: savedObjectsMigrationConfig.poll_interval,
          skip: savedObjectsMigrationConfig.skip,
        },
      };

      const tenantIndices = await searchGuardBackend.getTenantInfoWithInternalUser();
      this.tenantIndices =
        !tenantIndices || typeof tenantIndices !== 'object' ? [] : Object.keys(tenantIndices);

      const typeRegistry = savedObjects.getTypeRegistry();
      const kibanaConfig = configService.get('kibana');

      const migratorDeps = {
        client: createMigrationEsClient(esClient.asInternalUser, this.logger),
        kibanaConfig,
        typeRegistry,
        logger: this.logger,
        kibanaVersion: this.coreContext.env.packageInfo.version,
        savedObjectsConfig: config.migration,
        savedObjectValidations: {}, // Kibana NP doesn't have this yet.
      };

      defineMigrateRoutes({
        KibanaMigrator,
        migratorDeps,
        kibanaRouter,
        searchGuardBackend,
      });

      const migrator = new KibanaMigrator(migratorDeps);

      this.logger.info('Putting the tenants index template in Elasticsearch ...');
      await putTenantIndexTemplate({
        esClient,
        logger: this.logger,
        kibanaIndexName: kibanaConfig.index,
        mappings: migrator.getActiveMappings(),
      });

      const isMigrationNeeded = config.migration.skip || !!this.tenantIndices.length;
      if (!isMigrationNeeded) {
        if (config.migration.skip) {
          this.logger.info('You configured to skip tenants saved objects migration.');
        } else {
          this.logger.info(
            'No tenants indices found. Thus there is no need for the tenants saved objects migration.'
          );
        }

        return;
      }

      const migratorPromises = this.tenantIndices.map((index) => {
        return new KibanaMigrator({
          ...migratorDeps,
          kibanaConfig: { ...kibanaConfig, index },
        }).runMigrations();
      });

      this.logger.info('Starting tenants saved objects migration ...');

      // Don't do await Promise.allSettled.
      // We must avoid waiting for all promisses to fulfill here. We may have a lot of tenants.
      Promise.allSettled(migratorPromises).then((responses) => {
        responses.forEach((response, i) => {
          if (response.status === 'fulfilled') {
            this.logger.info(`Fulfilled migration for index ${this.tenantIndices[i]}.`);
            this.logger.debug(`Migration result:\n${JSON.stringify(response.value, null, 2)}`);
          } else {
            this.logger.error(
              `Unable to fulfill migration for index ${this.tenantIndices[i]} ${JSON.stringify(
                response.value
              )}`
            );
          }
        });
      });
    } catch (error) {
      throw error;
    }
  }
}

function putTenantIndexTemplate({ esClient, logger, kibanaIndexName, mappings }) {
  const params = {
    name: 'tenant_template',
    body: {
      index_patterns: [
        kibanaIndexName + '_-*_*',
        kibanaIndexName + '_0*_*',
        kibanaIndexName + '_1*_*',
        kibanaIndexName + '_2*_*',
        kibanaIndexName + '_3*_*',
        kibanaIndexName + '_4*_*',
        kibanaIndexName + '_5*_*',
        kibanaIndexName + '_6*_*',
        kibanaIndexName + '_7*_*',
        kibanaIndexName + '_8*_*',
        kibanaIndexName + '_9*_*',
      ],
      settings: {
        number_of_shards: 1,
      },
      mappings,
    },
  };

  return migrationRetryCallCluster(
    () => esClient.asInternalUser.indices.putTemplate(params),
    logger
  );
}
