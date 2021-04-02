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
      const savedObjectsMigrationConfig = configService.get(
        'searchguard.multitenancy.saved_objects_migration'
      );

      const config = {
        migration: {
          batchSize: savedObjectsMigrationConfig.batch_size,
          scrollDuration: savedObjectsMigrationConfig.scroll_duration,
          pollInterval: savedObjectsMigrationConfig.poll_interval,
          skip: savedObjectsMigrationConfig.skip,
          enableV2: savedObjectsMigrationConfig.enableV2,
        },
      };

      const tenantIndices = await searchGuardBackend.getTenantInfoWithInternalUser();
      this.tenantIndices =
        !tenantIndices || typeof tenantIndices !== 'object' ? [] : Object.keys(tenantIndices);

      const typeRegistry = savedObjects.getTypeRegistry();
      const kibanaConfig = configService.get('kibana');

      const migratorDeps = {
        client: esClient.asInternalUser,
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

      this.logger.info('Starting tenants saved objects migration ...');

      for (let i = 0; i < this.tenantIndices.length; i++) {
        let response;

        try {
          // We execute the index migration sequentially because Elasticsearch doesn't keep up
          // with parallel migration for a large number of indices (tenants).
          // https://git.floragunn.com/search-guard/search-guard-kibana-plugin/-/issues/315
          const kibanaMigrator = new KibanaMigrator({
            ...migratorDeps,
            kibanaConfig: { ...kibanaConfig, index: this.tenantIndices[i] },
          });

          kibanaMigrator.prepareMigrations();
          await kibanaMigrator.runMigrations();

          this.logger.info(`Fulfilled migration for index ${this.tenantIndices[i]}.`);
          this.logger.debug(`Migration result:\n${JSON.stringify(response, null, 2)}`);
        } catch (error) {
          this.logger.error(
            `Unable to fulfill migration for index ${this.tenantIndices[i]}, ${error}`
          );
        }
      }
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
