
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

export class ServerPlugin {
  constructor(initializerContext) {
    this.logger = initializerContext.logger.get();
    this.initContext = initializerContext;
    this.signalsApp = new Signals(this.initContext);
    this.searchGuardApp = new SearchGuard(this.initContext);
    this.multiTenancyApp = new Multitenancy(this.initContext);
  }

  /*
  ATTENTION! Kibana imposes restrictions to the plugin lifecycle methods:
  1. A method must not return promise.
  2. A method execution time limit is 10 seconds.
  */
  setup(core, pluginDependencies) {
    process.on('unhandledRejection', (error) => {
      console.error(error); // This prints error with stack included (as for normal errors)
      throw error; // Following best practices re-throw error and let the process exit with error code
    });

    this.hapiServer = core.hapiServer;
    this.kibanaRouter = core.http.createRouter();
    this.elasticsearch = core.elasticsearch;

    const {
      configService,
      searchGuardBackend,
      searchGuardConfigurationBackend,
    } = this.searchGuardApp.setupSync({
      core,
      pluginDependencies,
      hapiServer: this.hapiServer,
      kibanaRouter: this.kibanaRouter,
    });

    this.configService = configService;
    this.searchGuardBackend = searchGuardBackend;
    this.searchGuardConfigurationBackend = searchGuardConfigurationBackend;

    this.signalsApp.setupSync({
      core,
      kibanaRouter: this.kibanaRouter,
      hapiServer: core.hapiServer,
      searchguardBackendService: searchGuardBackend,
    });

    const cookieConfig = {
      encryptionKey: this.configService.get('searchguard.cookie.password'),
      name: this.configService.get('searchguard.cookie.name'),
      isSecure: this.configService.get('searchguard.cookie.secure'),
      //validateFunc: this.sessionValidator(this.server),
      validate: () => {
        // @todo Just implement our own validation function again
        return { isValid: true, path: '/' };
      },

      clearInvalid: true,
      ttl: this.configService.get('searchguard.cookie.ttl'),
      isSameSite: this.configService.get('searchguard.cookie.isSameSite'),
    };

    if (this.configService.get('searchguard.cookie.domain')) {
      cookieConfig.domain = this.configService.get('searchguard.cookie.domain');
    }

    const isMtEnabled = this.configService.get('searchguard.multitenancy.enabled');
    if (isMtEnabled) {
      this.multiTenancyApp.setupSync({
        configService,
        searchGuardBackend,
        hapiServer: this.hapiServer,
      });
    }

    (async () => {
      this.sessionStorageFactory = await core.http.createCookieSessionStorageFactory(cookieConfig);
      console.log('*** Got the factory?', this.sessionStorageFactory);

      const { authInstance } = await this.searchGuardApp.setup({
        core,
        hapiServer: this.hapiServer,
        sessionStorageFactory: this.sessionStorageFactory,
      });

      core.http.registerAuth(authInstance.checkAuth);
      core.http.registerRouteHandlerContext('sg_np', (context, request) => {
        console.log('********** What is context when setting up?', context);
        return {
          sessionStorageFactory: this.sessionStorageFactory,
          something: () => {
            return 'Testar!';
          },
        };
      });

      core.http.registerRouteHandlerContext('another-sg-context', (context, request) => {
        console.log('********** What is context when setting up another?', context);
        return {
          somethingElse: () => {
            console.log('Micke');
            return 'Testar!';
          },
        };
      });

      if (isMtEnabled) {
        this.multiTenancyApp.setup({
          authInstance,
          hapiServer: this.hapiServer,
          elasticsearch: this.elasticsearch,
          spacesPlugin: pluginDependencies.spaces || null,
          kibanaCore: core,
          sessionStorageFactory: this.sessionStorageFactory,
        });
      }
    })();
  }

  start(core) {
    const isMtEnabled = this.configService.get('searchguard.multitenancy.enabled');
    if (isMtEnabled) {
      // ATTENTION! We want to make sure the multitenancy app migrates saved objects
      // in the tenants indices before doing any operation on indices
      this.multiTenancyApp.start({
        core,
        kibanaRouter: this.kibanaRouter,
      });
    }
  }
}
