/*
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
import { Alerting, Multitenancy, Security, AuthTokens } from './applications';
import { ConfigService } from '../common/config_service';
import EliatraSuiteBackend from './applications/security/backend/security';
import EliatraSuiteConfigurationBackend from './applications/security/configuration/backend/eliatrasuite_configuration_backend';

async function getConfigService({ logger, initContext, clusterClient }) {
  try {
    const [kibanaConfig, spConfig] = await Promise.all([
      initContext.config.legacy.globalConfig$.pipe(first()).toPromise(),
      initContext.config.create().pipe(first()).toPromise(),
    ]);

    return new ConfigService({
      ...kibanaConfig,
      opensearch: clusterClient.config,
      eliatra: spConfig,
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
    this.alertingApp = new Alerting(this.initContext);
    this.securityApp = new Security(this.initContext);
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
      const [{ opensearch }] = await core.getStartServices();

      const configService = await getConfigService({
        logger: this.logger,
        initContext: this.initContext,
        clusterClient: opensearch.client,
      });

      const eliatraSuiteBackend = new EliatraSuiteBackend({ opensearch, configService, core });

      const eliatraSuiteConfigurationBackend = new EliatraSuiteConfigurationBackend({
        opensearch,
      });

      const { authManager, sessionStorageFactory, kerberos } = await this.securityApp.setup({
        core,
        pluginDependencies,
        configService,
        kibanaRouter: this.kibanaRouter,
        eliatraSuiteBackend,
        eliatraSuiteConfigurationBackend,
      });

      // Helper for the routes
      core.http.registerRouteHandlerContext('eliatra', () => {
        return {
          security: {
            sessionStorageFactory,
            authManager,
          }
        };
      });

      const isMtEnabled = configService.get('eliatra.security.multitenancy.enabled');
      if (isMtEnabled) {
        this.multiTenancyApp.setup({
          authManager,
          kerberos,
          kibanaCore: core,
          sessionStorageFactory,
          pluginDependencies,
          eliatraSuiteBackend,
          configService,
        });
      }
    })();
  }

  start(core) {
    (async () => {
      const configService = await getConfigService({
        logger: this.logger,
        initContext: this.initContext,
        clusterClient: core.opensearch.client,
      });

      const eliatraSuiteBackend = new EliatraSuiteBackend({ opensearch: core.opensearch, configService, core });

      this.alertingApp.start({
        core,
        kibanaRouter: this.kibanaRouter,
        eliatraSuiteBackendService: eliatraSuiteBackend,
      });

      this.authTokensApp.start({ core, kibanaRouter: this.kibanaRouter });

      const isMtEnabled = configService.get('eliatra.security.multitenancy.enabled');
      if (isMtEnabled) {
        // ATTENTION! We want to make sure the multitenancy app migrates saved objects
        // in the tenants indices before doing any operation on indices
        this.multiTenancyApp.start({
          core,
          kibanaRouter: this.kibanaRouter,
          eliatraSuiteBackend,
          configService,
        });
      }
    })();
  }
}
