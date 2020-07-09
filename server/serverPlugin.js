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

import { Signals, Multitenancy, SearchGuard } from './applications';

export class Plugin {
  constructor(initializerContext) {
    this.logger = initializerContext.logger.get();
    this.initContext = initializerContext;
    this.signalsApp = new Signals(this.initContext);
    this.searchGuardApp = new SearchGuard(this.initContext);
  }

  async setup(core, pluginDependencies) {
    const router = core.http.createRouter();

    process.on('unhandledRejection', (error) => {
      console.error(error); // This prints error with stack included (as for normal errors)
      throw error; // Following best practices re-throw error and let the process exit with error code
    });
    /**
     * The patched values
     */
    const server = core.hapiServer;

    const { configService, searchGuardBackend, authInstance } = await this.searchGuardApp.setup({
      router,
      core,
      server,
      pluginDependencies,
    });

    this.configService = configService;

    // MT
    if (this.configService.get('searchguard.multitenancy.enabled')) {
      // ATTENTION! We want to make sure the multitenancy app migrates saved objects
      // in the tenants indices before doing any any operation on indices
      this.multinenancyApp = new Multitenancy(this.initContext);

      try {
        await this.multinenancyApp.setup({
          hapiServer: core.hapiServer,
          elasticsearch: core.elasticsearch,
          configService: this.configService,
          spacesPlugin: pluginDependencies.spaces || null,
          router,
          authInstance,
          searchGuardBackend,
        });
      } catch (error) {
        this.logger.error(error);
        throw new Error(error);
      }
    }

    // @todo Signals app access
    this.signalsApp.setup({
      core,
      router,
      hapiServer: core.hapiServer,
      searchguardBackendService: searchGuardBackend,
    });

    return {
      something: 'returned',
    };
  }

  async start(core) {
    try {
      if (this.configService.get('searchguard.multitenancy.enabled')) {
        await this.multinenancyApp.start(core.savedObjects);
      } else {
        this.logger.info('Multitenancy is disabled');
      }
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }

    return {
      something: 'returned',
    };
  }

  stop() {
    return {
      something: 'returned',
    };
  }
}
