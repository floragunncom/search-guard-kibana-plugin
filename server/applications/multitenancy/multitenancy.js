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
import { DocLinksService} from '@kbn/core-doc-links-server-internal';
import { defineMultitenancyRoutes } from './routes';
import { MultitenancyLifecycle } from './multitenancy_lifecycle';

export class Multitenancy {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.logger = coreContext.logger.get('searchguard-multitenancy');
    this.enabled = true;
  }

  async setup({
    kibanaRouter,
    authManager,
    kerberos,
    kibanaCore,
    sessionStorageFactory,
    pluginDependencies,
    configService,
    searchGuardBackend,
    spacesService,
    tenantService,
    savedObjects,
    elasticsearch,
  }) {
    this.logger.debug('Setup app');

    const requestHeadersWhitelist = configService.get('elasticsearch.requestHeadersWhitelist');
    if (!requestHeadersWhitelist.includes('sgtenant')) {
      throw new Error(
        'No tenant header found in whitelist. Please add sgtenant to elasticsearch.requestHeadersWhitelist in kibana.yml'
      );
    }



    try {
      const multitenancyLifecycle = new MultitenancyLifecycle({
        authManager,
        kerberos,
        searchGuardBackend,
        configService,
        sessionStorageFactory,
        logger: this.logger,
        clusterClient: elasticsearch.client,
        pluginDependencies,
        spacesService,
        kibanaCore,
      });

      kibanaCore.http.registerOnPreAuth(multitenancyLifecycle.onPreAuth);



    } catch (error) {
      this.logger.error(`setup: ${error.toString()} ${error.stack}`);
    }
  }

  async disableMT(){

  }

  async start({ core, searchGuardBackend, configService, kibanaRouter, elasticsearch, sessionStorageFactory }) {
    this.logger.debug('Start app');
    /* TODO Dynamic
    const requestHeadersWhitelist = configService.get('elasticsearch.requestHeadersWhitelist');
    if (!requestHeadersWhitelist.includes('sgtenant')) {
      throw new Error(
        'No tenant header found in whitelist. Please add sgtenant to elasticsearch.requestHeadersWhitelist in kibana.yml'
      );
    }

     */

    defineMultitenancyRoutes({
      router: kibanaRouter,
      searchGuardBackend,
      config: configService,
      sessionStorageFactory, // TODO or take this from the route context?
      logger: this.logger,
      clusterClient: elasticsearch.client,
    });
  }
}
