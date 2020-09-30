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

import { get } from 'lodash';
import { migrationRetryCallCluster } from '../../../../../src/core/server/elasticsearch/client';
import { createMigrationEsClient } from '../../../../../src/core/server/saved_objects/migrations/core';
import { KibanaMigrator } from '../../../../../src/core/server/saved_objects/migrations';

import { defineMigrateRoutes } from './routes';

export function callCluster({ esClient, path, params, logger }) {
  const fn = get(esClient, path);
  return migrationRetryCallCluster(() => fn(params), logger);
}

export class TenantsMigrationService {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.logger = coreContext.logger.get('tenants-migration-service');
  }

  setupSync({ configService }) {
    this.logger.debug('Setup tenants saved objects migration');
    this.configService = configService;

    try {
      const savedObjectsConfig = this.configService.get('searchguard.saved_objects');
      const savedObjectsMigrationConfig = this.configService.get(
        'searchguard.multitenancy.saved_objects_migration'
      );

      this.config = {
        maxImportPayloadBytes: savedObjectsConfig.max_import_payload_bytes,
        maxImportExportSize: savedObjectsConfig.max_import_export_size,
        migration: {
          batchSize: savedObjectsMigrationConfig.batch_size,
          scrollDuration: savedObjectsMigrationConfig.scroll_duration,
          pollInterval: savedObjectsMigrationConfig.poll_interval,
          skip: savedObjectsMigrationConfig.skip,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async start({ savedObjects, searchGuardBackend, esClient, kibanaRouter }) {
    this.logger.debug('Start tenants saved objects migration');

    try {
      const didSetupSyncRun = this.config && this.configService;
      if (!didSetupSyncRun) {
        throw new Error('You must run setupSync first!');
      }

      const tenantIndices = await searchGuardBackend.getTenantInfoWithInternalUser();
      this.tenantIndices =
        !tenantIndices || typeof tenantIndices !== 'object' ? [] : Object.keys(tenantIndices);

      const typeRegistry = savedObjects.getTypeRegistry();
      const kibanaConfig = this.configService.get('kibana');

      const migratorDeps = {
        client: createMigrationEsClient(esClient.asInternalUser, this.logger),
        kibanaConfig,
        typeRegistry,
        logger: this.logger,
        kibanaVersion: this.coreContext.env.packageInfo.version,
        savedObjectsConfig: this.config.migration,
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

      const isMigrationNeeded = this.config.migration.skip || !!this.tenantIndices.length;
      if (!isMigrationNeeded) {
        if (this.config.migration.skip) {
          this.logger.info('You configured to skip tenants saved objects migration.');
        } else {
          this.logger.info(
            'No tenants indices found. Thus there is no need for the tenants saved objects migration.'
          );
        }

        return;
      }

      this.logger.info('Starting tenants saved objects migration ...');

      const migratorPromises = this.tenantIndices.map((index) =>
        new KibanaMigrator({
          ...migratorDeps,
          kibanaConfig: { ...kibanaConfig, index },
        }).runMigrations()
      );

      // Don't do await Promise.allSettled.
      // We must avoid waiting for all promisses to fulfill here. We may have a lot of tenants.
      Promise.allSettled(migratorPromises).then((responses) => {
        responses.forEach((response, i) => {
          const messageDetails = `${this.tenantIndices[i]} ${JSON.stringify(response.value)}`;
          if (response.status === 'fulfilled') {
            this.logger.info(`Fulfilled migration for index ${messageDetails}`);
          } else {
            this.logger.error(`Unable to fulfill migration for index ${messageDetails}`);
          }
        });
      });
    } catch (error) {
      throw error;
    }
  }
}

async function putTenantIndexTemplate({ esClient, logger, kibanaIndexName, mappings }) {
  return callCluster({
    logger,
    esClient,
    path: 'asInternalUser.indices.putTemplate',
    params: {
      name: `tenant_template`,
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
    },
  });
}
