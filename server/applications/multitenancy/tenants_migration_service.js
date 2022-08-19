/*
 *    Copyright 2021 floragunn GmbH
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

import { migrationRetryCallCluster } from '../../../../../src/core/server/elasticsearch/client';
import { KibanaMigrator } from '../../../../../src/core/server/saved_objects/migrations';

import { defineMigrateRoutes } from './routes';
import { ByteSizeValue } from '@kbn/config-schema';
import { DEFAULT_CONFIG } from '../../default_config';

export function setupMigratorDependencies({
  configService,
  esClient,
  savedObjects,
  kibanaVersion,
  logger,
}) {
  const savedObjectsMigrationConfig = configService.get(
    'searchguard.multitenancy.saved_objects_migration'
  );

  const soMigrationsConfig = {
    batchSize: savedObjectsMigrationConfig.batch_size,
    scrollDuration: savedObjectsMigrationConfig.scroll_duration,
    pollInterval: savedObjectsMigrationConfig.poll_interval,
    skip: savedObjectsMigrationConfig.skip,
    enableV2: savedObjectsMigrationConfig.enableV2,
    maxBatchSizeBytes: savedObjectsMigrationConfig.max_batch_size ? ByteSizeValue.parse(savedObjectsMigrationConfig.max_batch_size) : ByteSizeValue.parse(DEFAULT_CONFIG.multitenancy.saved_objects_migration.max_batch_size),
  };

  const typeRegistry = savedObjects.getTypeRegistry();
  const kibanaConfig = configService.get('kibana');

  const migratorDeps = {
    client: esClient.asInternalUser,
    kibanaConfig,
    typeRegistry,
    logger,
    kibanaVersion,
    soMigrationsConfig,
  };

  return { soMigrationsConfig, typeRegistry, kibanaConfig, migratorDeps };
}

export class TenantsMigrationService {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.kibanaVersion = this.coreContext.env.packageInfo.version;
    this.logger = coreContext.logger.get('tenants-migration-service');
  }

  async setup({ configService, savedObjects, esClient, kibanaRouter, searchGuardBackend }) {
    const { migratorDeps } = setupMigratorDependencies({
      configService,
      esClient,
      savedObjects,
      kibanaVersion: this.kibanaVersion,
      logger: this.logger,
    });

    defineMigrateRoutes({
      KibanaMigrator,
      migratorDeps,
      kibanaRouter,
      searchGuardBackend,
    });
  }

  async start({ searchGuardBackend, esClient, configService, savedObjects }) {
    this.logger.debug('Start tenants saved objects migration');

    try {
      const { soMigrationsConfig, migratorDeps, kibanaConfig } = setupMigratorDependencies({
        configService,
        esClient,
        savedObjects,
        kibanaVersion: this.kibanaVersion,
        logger: this.logger,
      });

      const tenantIndices = await searchGuardBackend.getTenantInfoWithInternalUser();
      this.tenantIndices =
        !tenantIndices || typeof tenantIndices !== 'object' ? [] : Object.keys(tenantIndices);

      const migrator = new KibanaMigrator(migratorDeps);

      const isMigrationNeeded = soMigrationsConfig.skip || !!this.tenantIndices.length;
      if (!isMigrationNeeded) {
        if (soMigrationsConfig.skip) {
          this.logger.info('You configured to skip tenants saved objects migration.');
        } else {
          this.logger.info(
            'No tenants indices found. Thus there is no need for the tenants saved objects migration.'
          );
        }

        return;
      }

      this.logger.info('Starting tenants saved objects migration ...');

      for (let i = 0; i < this.tenantIndices.length; i++) {
        let response;

        try {
          // We execute the index migration sequentially because Elasticsearch doesn't keep up
          // with parallel migration for a large number of indices (tenants).
          // https://git.floragunn.com/search-guard/search-guard-kibana-plugin/-/issues/315
          const kibanaMigrator = new KibanaMigrator({
            ...migratorDeps,
            kibanaIndex: this.tenantIndices[i],
          });

          kibanaMigrator.prepareMigrations();
          await kibanaMigrator.runMigrations();

          this.logger.info(`Fulfilled migration for index ${this.tenantIndices[i]}.`);
          this.logger.debug(`Migration result:\n${JSON.stringify(response, null, 2)}`);
        } catch (error) {
          this.logger.error(
            `Unable to fulfill migration for index ${this.tenantIndices[i]}, ${error}`, error
          );
        }
      }
    } catch (error) {
      throw error;
    }
  }
}
