/*
 *    Copyright 2020 floragunn GmbH
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

import { first } from 'rxjs/operators';
import { Signals, Multitenancy, SearchGuard, AuthTokens } from './applications';
import { ConfigService } from '../common/config_service';
import SearchGuardBackend from './applications/searchguard/backend/searchguard';
import SearchGuardConfigurationBackend from './applications/searchguard/configuration/backend/searchguard_configuration_backend';

async function getConfigService({ logger, initContext, clusterClient }) {
  try {
    const [kibanaConfig, sgConfig] = await Promise.all([
      initContext.config.legacy.globalConfig$.pipe(first()).toPromise(),
      initContext.config.create().pipe(first()).toPromise(),
    ]);

    return new ConfigService({
      ...kibanaConfig,
      elasticsearch: clusterClient.config,
      searchguard: sgConfig,
    });
  } catch (error) {
    logger.error(`Failed to fetch the Kibana config, ${error}`);
    throw error;
  }
}

export class ServerPlugin {
  constructor(initializerContext) {
    this.logger = initializerContext.logger.get();
    this.initContext = initializerContext;
    this.signalsApp = new Signals(this.initContext);
    this.searchGuardApp = new SearchGuard(this.initContext);
    this.multiTenancyApp = new Multitenancy(this.initContext);
    this.authTokensApp = new AuthTokens(this.initContext);
  }

  /*
  ATTENTION! Kibana imposes restrictions to the plugin lifecycle methods:
  1. A method must not return promise.
  2. A method execution time limit is 10 seconds.
  */
  setup(core, pluginDependencies) {
    process.on('unhandledRejection', (error) => {
      console.error(error); // This prints error with stack included (as for normal errors)
    });

    this.kibanaRouter = core.http.createRouter();

    (async () => {
      const [{ elasticsearch }] = await core.getStartServices();
      const searchGuardBackend = new SearchGuardBackend({ elasticsearch });
      const searchGuardConfigurationBackend = new SearchGuardConfigurationBackend({
        elasticsearch,
      });

      const configService = await getConfigService({
        logger: this.logger,
        initContext: this.initContext,
        clusterClient: elasticsearch.client,
      });

      const { authManager, sessionStorageFactory } = await this.searchGuardApp.setup({
        core,
        pluginDependencies,
        configService,
        kibanaRouter: this.kibanaRouter,
        searchGuardBackend,
        searchGuardConfigurationBackend,
      });

      // Helper for the routes
      core.http.registerRouteHandlerContext('searchGuard', () => {
        return {
          sessionStorageFactory,
          authManager,
        };
      });

      const isMtEnabled = configService.get('searchguard.multitenancy.enabled');
      if (isMtEnabled) {
        this.multiTenancyApp.setup({
          authManager,
          kibanaCore: core,
          sessionStorageFactory,
          pluginDependencies,
          searchGuardBackend,
          configService,
        });
      }
    })();
  }

  start(core) {
    (async () => {
      const searchGuardBackend = new SearchGuardBackend({ elasticsearch: core.elasticsearch });
      const configService = await getConfigService({
        logger: this.logger,
        initContext: this.initContext,
        clusterClient: core.elasticsearch.client,
      });

      this.signalsApp.start({
        core,
        kibanaRouter: this.kibanaRouter,
        searchguardBackendService: searchGuardBackend,
      });

      this.authTokensApp.start({ core, kibanaRouter: this.kibanaRouter });

      const isMtEnabled = configService.get('searchguard.multitenancy.enabled');
      if (isMtEnabled) {
        // ATTENTION! We want to make sure the multitenancy app migrates saved objects
        // in the tenants indices before doing any operation on indices
        this.multiTenancyApp.start({
          core,
          kibanaRouter: this.kibanaRouter,
          searchGuardBackend,
          configService,
        });
      }
    })();
  }
}
