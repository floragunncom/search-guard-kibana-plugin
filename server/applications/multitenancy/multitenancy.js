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

import { TenantsMigrationService } from './tenants_migration_service';
import { defineMultitenancyRoutes } from './routes';
import { requestHeaders } from './request_headers';

export class Multitenancy {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.logger = coreContext.logger.get('searchguard-multitenancy');
    this.tenantsMigration = new TenantsMigrationService(coreContext);
  }

  setupSync({ hapiServer, searchGuardBackend, elasticsearch, configService }) {
    this.logger.debug('Setup sync app');

    try {
      this.hapiServer = hapiServer;
      this.searchGuardBackend = searchGuardBackend;
      this.elasticsearch = elasticsearch;
      this.configService = configService;

      const requestHeadersWhitelist = this.configService.get(
        'elasticsearch.requestHeadersWhitelist'
      );

      if (!requestHeadersWhitelist.includes('sgtenant')) {
        throw new Error(
          'No tenant header found in whitelist. Please add sgtenant to elasticsearch.requestHeadersWhitelist in kibana.yml'
        );
      }

      this.tenantsMigration.setupSync({ configService });
    } catch (error) {
      this.logger.error(error);
    }
  }

  async setup({
    kibanaCore,
    authInstance,
    spacesPlugin = null,
    elasticsearch,
    hapiServer,
    sessionStorageFactory,
  }) {
    this.logger.debug('Setup app');

    try {
      const didSetupSyncRun = this.searchGuardBackend && this.configService;
      if (!didSetupSyncRun) {
        throw new Error('You must run setupSync first!');
      }

      defineMultitenancyRoutes({
        kibanaCore,
        searchGuardBackend: this.searchGuardBackend,
        config: this.configService,
        sessionStorageFactory,
        logger: this.logger,
      });

      requestHeaders({
        authInstance,
        spacesPlugin,
        elasticsearch,
        server: hapiServer,
        config: this.configService,
        searchGuardBackend: this.searchGuardBackend,
        kibanaCore,
        sessionStorageFactory,
        logger: this.logger,
      });
    } catch (error) {
      this.logger.error(`setup: ${error.toString()} ${error.stack}`);
    }
  }

  async start({ core, kibanaRouter }) {
    this.logger.debug('Start app');

    try {
      const esClient = core.elasticsearch.client;

      const didSetupSyncRun = this.searchGuardBackend;
      if (!didSetupSyncRun) {
        throw new Error('You must run setupSync first!');
      }

      await this.tenantsMigration.start({
        esClient,
        kibanaRouter,
        savedObjects: core.savedObjects,
        searchGuardBackend: this.searchGuardBackend,
      });
    } catch (error) {
      this.logger.error(`start: ${error.toString()} ${error.stack}`);
    }
  }
}
