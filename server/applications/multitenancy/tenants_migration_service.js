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

import { first } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

import { SavedObjectConfig } from '../../../../../src/core/server/saved_objects/saved_objects_config';
import { retryCallCluster } from '../../../../../src/core/server/elasticsearch/retry_call_cluster';
import { KibanaMigrator } from '../../../../../src/core/server/saved_objects/migrations';

import { defineMigrateRoute } from './routes';

export class TenantsMigrationService {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.logger = coreContext.logger.get('tenants-migration-service');
  }

  async setup({ searchGuardBackend, elasticsearch, router }) {
    this.logger.debug('Setup tenants saved objects migration');
    this.searchGuardBackend = searchGuardBackend;
    this.elasticsearch = elasticsearch;
    this.router = router;

    try {
      const tenantIndices = await searchGuardBackend.getTenantInfoWithInternalUser();
      this.tenantIndices =
        !tenantIndices || typeof tenantIndices !== 'object' ? [] : Object.keys(tenantIndices);

      const [savedObjectsConfig, savedObjectsMigrationsConfig] = await combineLatest([
        this.coreContext.configService.atPath('savedObjects'),
        this.coreContext.configService.atPath('migrations'),
      ])
        .pipe(first())
        .toPromise();

      this.config = new SavedObjectConfig(savedObjectsConfig, savedObjectsMigrationsConfig);
    } catch (error) {
      throw error;
    }
  }

  async start(savedObjects) {
    try {
      if (!this.config) {
        throw new Error('You must run setup first!');
      }

      const typeRegistry = savedObjects.getTypeRegistry();

      const kibanaConfig = await this.coreContext.configService
        .atPath('kibana')
        .pipe(first())
        .toPromise();

      const callCluster = retryCallCluster(
        this.elasticsearch.adminClient.callAsInternalUser,
        this.logger
      );

      this.logger.info('Putting the tenants index template in Elasticsearch ...');

      const migratorDeps = {
        callCluster,
        kibanaConfig,
        typeRegistry,
        logger: this.logger,
        kibanaVersion: this.coreContext.env.packageInfo.version,
        savedObjectsConfig: this.config.migration,
        savedObjectValidations: {}, // Kibana NP doesn't have this yet.
      };

      const migrator = new KibanaMigrator(migratorDeps);

      await putTenantIndexTemplate({
        callCluster,
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

      defineMigrateRoute({
        migratorDeps,
        router: this.router,
        searchGuardBackend: this.searchGuardBackend,
      });

      const migrators = this.tenantIndices.map(index => {
        return new KibanaMigrator({
          ...migratorDeps,
          kibanaConfig: { ...kibanaConfig, index },
        });
      });

      this.logger.info('Starting tenants saved objects migration ...');

      /*
        We must avoid waiting for all promisses to fulfill here. We may have a lot of tenants.
        And Kibana fails if a plugin start process is longer then 30 sec.
      */
      Promise.all(migrators.map(migrator => migrator.runMigrations())).catch(error => {
        this.logger.error(`Fail to run migration: ${error.toString()}: ${error.stack}`);
      });
    } catch (error) {
      throw error;
    }
  }
}

async function putTenantIndexTemplate({ callCluster, kibanaIndexName, mappings }) {
  return callCluster('indices.putTemplate', {
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
  });
}
