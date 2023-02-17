/* eslint-disable @osd/eslint/require-license-header */
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

import { migrationRetryCallCluster } from '../../../../../src/core/server/opensearch/client';
import { createMigrationOpenSearchClient } from '../../../../../src/core/server/saved_objects/migrations/core';
import { OpenSearchDashboardsMigrator } from '../../../../../src/core/server/saved_objects/migrations';

import { defineMigrateRoutes } from './routes';

export class TenantsMigrationService {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.logger = coreContext.logger.get('tenants-migration-service');
  }

  async start({ savedObjects, eliatraSuiteBackend, esClient, kibanaRouter, configService }) {
    this.logger.debug('Start tenants saved objects migration');

    try {
      const savedObjectsConfig = configService.get('eliatra.security.saved_objects');
      const savedObjectsMigrationConfig = configService.get(
        'eliatra.security.multitenancy.saved_objects_migration'
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

      const tenantIndices = await eliatraSuiteBackend.getTenantInfoWithInternalUser();
      this.tenantIndices =
        !tenantIndices || typeof tenantIndices !== 'object' ? [] : Object.keys(tenantIndices);

      const typeRegistry = savedObjects.getTypeRegistry();
      const opensearchDashboardsConfig = configService.get('opensearchDashboards');

      const migratorDeps = {
        client: createMigrationOpenSearchClient(esClient.asInternalUser, this.logger),
        opensearchDashboardsConfig,
        typeRegistry,
        logger: this.logger,
        opensearchDashboardsVersion: this.coreContext.env.packageInfo.version,
        savedObjectsConfig: config.migration,
        savedObjectValidations: {}, // Kibana NP doesn't have this yet.
      };

      defineMigrateRoutes({
        OpenSearchDashboardsMigrator,
        migratorDeps,
        kibanaRouter,
        eliatraSuiteBackend,
      });

      const migrator = new OpenSearchDashboardsMigrator(migratorDeps);

      this.logger.info('Putting the tenants index template in OpenSearch ...');
      await putTenantIndexTemplate({
        esClient,
        logger: this.logger,
        opensearchDashboardsIndexName: opensearchDashboardsConfig.index,
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
          response = await new OpenSearchDashboardsMigrator({
            ...migratorDeps,
            opensearchDashboardsConfig: {
              ...opensearchDashboardsConfig,
              index: this.tenantIndices[i]
            },
          }).runMigrations();

          this.logger.info(`Fulfilled migration for index ${this.tenantIndices[i]}.`);
          this.logger.debug(`Migration result:\n${JSON.stringify(response, null, 2)}`);
        } catch (error) {
          this.logger.error(
            `Unable to fulfill migration for index ${this.tenantIndices[i]}, ${error} ${error.stack}`
          );
        }
      }
    } catch (error) {
      throw error;
    }
  }
}

function putTenantIndexTemplate({ esClient, logger, opensearchDashboardsIndexName, mappings }) {
  const params = {
    name: 'tenant_template',
    body: {
      index_patterns: [
        opensearchDashboardsIndexName + '_-*_*',
        opensearchDashboardsIndexName + '_0*_*',
        opensearchDashboardsIndexName + '_1*_*',
        opensearchDashboardsIndexName + '_2*_*',
        opensearchDashboardsIndexName + '_3*_*',
        opensearchDashboardsIndexName + '_4*_*',
        opensearchDashboardsIndexName + '_5*_*',
        opensearchDashboardsIndexName + '_6*_*',
        opensearchDashboardsIndexName + '_7*_*',
        opensearchDashboardsIndexName + '_8*_*',
        opensearchDashboardsIndexName + '_9*_*',
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
