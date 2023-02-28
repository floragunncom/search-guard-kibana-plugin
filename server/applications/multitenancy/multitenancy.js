/* eslint-disable @osd/eslint/require-license-header */
/**
 * Copyright 2023 Excelerate Technology Limited T/A Eliatra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * *    Copyright 2020 floragunn GmbH

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
import { MultitenancyLifecycle } from './multitenancy_lifecycle';

export class Multitenancy {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.logger = coreContext.logger.get('eliatrasuite-multitenancy');
    this.tenantsMigration = new TenantsMigrationService(coreContext);
  }

  async setup({
    authManager,
    kerberos,
    kibanaCore,
    sessionStorageFactory,
    pluginDependencies,
    configService,
    eliatraSuiteBackend,
  }) {
    this.logger.debug('Setup app');

    const requestHeadersWhitelist = configService.get('opensearch.requestHeadersWhitelist');
    if (!requestHeadersWhitelist.includes('sp_tenant')) {
      throw new Error(
        'No tenant header found in whitelist. Please add sp_tenant to opensearch.requestHeadersWhitelist in opensearch_dashboards.yml'
      );
    }

    try {
      const router = kibanaCore.http.createRouter();
      const [{ opensearch }] = await kibanaCore.getStartServices();

      const multitenancyLifecycle = new MultitenancyLifecycle({
        authManager,
        kerberos,
        eliatraSuiteBackend,
        configService,
        sessionStorageFactory,
        logger: this.logger,
        clusterClient: opensearch.client,
        pluginDependencies,
      });
      kibanaCore.http.registerOnPreAuth(multitenancyLifecycle.onPreAuth);

      defineMultitenancyRoutes({
        router,
        eliatraSuiteBackend,
        config: configService,
        sessionStorageFactory,
        logger: this.logger,
        clusterClient: opensearch.client,
      });
    } catch (error) {
      this.logger.error(`setup: ${error.toString()} ${error.stack}`);
    }
  }

  async start({ core, kibanaRouter, eliatraSuiteBackend, configService }) {
    this.logger.debug('Start app');
    const savedObjects = core.savedObjects;
    const esClient = core.opensearch.client;

    try {
      await this.tenantsMigration.start({
        esClient,
        kibanaRouter,
        savedObjects,
        eliatraSuiteBackend,
        configService,
      });
    } catch (error) {
      this.logger.error(`start: ${error.toString()} ${error.stack}`);
    }
  }
}
